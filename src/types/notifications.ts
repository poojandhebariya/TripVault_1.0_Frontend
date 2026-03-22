import type { VaultAuthor } from "./vault";

export type TagStatus = "pending" | "accepted" | "declined";

export type NotificationType = "TAG" | "LIKE";

export interface VaultNotification {
  id: string;
  type: NotificationType;
  vaultId: string;
  vaultTitle: string;
  vaultCoverUrl: string | null;
  actor: VaultAuthor;
  status: TagStatus | null; // null for LIKE
  isRead?: boolean;
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
