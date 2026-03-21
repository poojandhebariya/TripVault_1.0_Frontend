import type { VaultAuthor } from "./vault";

export type TagStatus = "pending" | "accepted" | "declined";

export interface VaultTagNotification {
  id: string;
  vaultId: string;
  vaultTitle: string;
  vaultCoverUrl: string | null;
  tagger: VaultAuthor;
  status: TagStatus;
  createdAt: string;
}

export interface TaggedVaultItem {
  id: string;
  vaultId: string;
  vaultTitle: string;
  vaultCoverUrl: string | null;
  author: VaultAuthor;
  status: TagStatus;
  taggedAt: string;
  location?: { label: string } | null;
  mood?: string | null;
}
