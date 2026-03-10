import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { vaultKeys } from "../tanstack/vault/keys";
import { userKeys } from "../tanstack/user/keys";
import type { Vault } from "../types/vault";
import type { User } from "../types/user";

const POLL_INTERVAL_MS = 60_000; // Check every 60 seconds

/**
 * Frontend equivalent of the backend cron job.
 * Every minute, scans `getMyVaults` cache for vaults whose `scheduledAt`
 * time has passed and promotes them from `schedule` → `publish`.
 *
 * If the promoted vault is `public`, it is also prepended to the
 * `getPublicVaults` page-1 home feed so it appears there immediately,
 * with the current user's author info attached so name/avatar displays correctly.
 *
 * No API call is made — purely a local cache update to keep the UI in
 * sync until the next real refetch from the server.
 */
export function useScheduledVaultPublisher(currentUser?: User) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const promoteExpiredScheduledVaults = () => {
    const now = new Date();

    // Collect the vaults that just got promoted so we can push them to the home feed
    const newlyPublished: Vault[] = [];

    queryClient.setQueryData<Vault[]>(vaultKeys.getMyVaults(), (old) => {
      if (!old || old.length === 0) return old;

      let didUpdate = false;

      const updated = old.map((vault) => {
        if (
          vault.status === "schedule" &&
          vault.scheduledAt &&
          new Date(vault.scheduledAt) <= now
        ) {
          didUpdate = true;
          const promoted: Vault = {
            ...vault,
            status: "publish" as const,
            scheduledAt: null,
          };
          // Track public ones so we can add them to the home feed below
          if (vault.visibility === "public") {
            newlyPublished.push(promoted);
          }
          return promoted;
        }
        return vault;
      });

      // Only return a new array reference if something actually changed
      return didUpdate ? updated : old;
    });

    // Push each newly published public vault to the front of the home feed (page 1)
    if (newlyPublished.length > 0) {
      queryClient.setQueryData(
        [...vaultKeys.getPublicVaults(), 1],
        (old: any) => {
          if (!old) return old;

          // Avoid duplicates — remove any entry with the same id before prepending
          const existingIds = new Set(
            newlyPublished.map((v) => v.id).filter(Boolean),
          );
          const filtered = (old.data ?? []).filter(
            (v: Vault) => !existingIds.has(v.id),
          );

          // Attach the current user's profile as the author so name/avatar render correctly
          const withAuthor = newlyPublished.map((v) => ({
            ...v,
            author:
              v.author ??
              (currentUser
                ? {
                    username: currentUser.username,
                    name: currentUser.name,
                    profilePicUrl: currentUser.profilePicUrl ?? null,
                  }
                : undefined),
          }));

          return {
            ...old,
            data: [...withAuthor, ...filtered],
          };
        },
      );

      // Update profile countriesVisited / placesVisited for each promoted vault
      newlyPublished.forEach((vault) => {
        if (!vault.location?.label) return;
        const country = vault.location.label.split(",").at(-1)?.trim() ?? "";
        const place = vault.location.label.split(",")[0]?.trim() ?? "";
        queryClient.setQueryData<User>(userKeys.getProfile(), (old) => {
          if (!old) return old;
          const newCountries =
            country && !old.countriesVisited.includes(country)
              ? [...old.countriesVisited, country]
              : old.countriesVisited;
          const newPlaces =
            place && !old.placesVisited.includes(place)
              ? [...old.placesVisited, place]
              : old.placesVisited;
          if (
            newCountries === old.countriesVisited &&
            newPlaces === old.placesVisited
          )
            return old;
          return {
            ...old,
            countriesVisited: newCountries,
            placesVisited: newPlaces,
          };
        });
      });
    }
  };

  useEffect(() => {
    // Run immediately on mount to catch vaults that expired while the app was closed
    promoteExpiredScheduledVaults();

    // Then keep checking on every interval
    intervalRef.current = setInterval(
      promoteExpiredScheduledVaults,
      POLL_INTERVAL_MS,
    );

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
    // queryClient is stable, so empty deps is safe here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
