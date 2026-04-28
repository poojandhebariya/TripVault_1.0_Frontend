import type { VaultAuthor } from "./vault";

export type TagStatus = "pending" | "accepted" | "declined";

/**
 * All notification types in TripVault:
 *   LIKE         – someone liked your vault
 *   TAG          – someone tagged you in a vault (requires accept/decline)
 *   COMMENT      – someone commented on your vault
 *   COMMENT_TAG  – someone @mentioned you in a comment
 *   FOLLOW       – someone followed you
 *   TAG_ACCEPTED – the person you tagged accepted (notifies the tagger)
 *   SAVE         – someone saved your vault
 */
export type NotificationType =
  | "LIKE"
  | "TAG"
  | "COMMENT"
  | "COMMENT_TAG"
  | "COMMENT_REPLY"
  | "FOLLOW"
  | "FOLLOW_REQUEST"
  | "FOLLOW_ACCEPTED"
  | "TAG_ACCEPTED"
  | "SAVE";

export interface VaultNotification {
  id: string;
  type: NotificationType;
  /** Present for vault-related notifications (LIKE, TAG, COMMENT, COMMENT_TAG, TAG_ACCEPTED, SAVE) */
  vaultId: string;
  vaultTitle: string;
  vaultCoverUrl: string | null;
  /** The user who triggered the notification */
  actor: VaultAuthor;
  /** Only set for TAG notifications */
  status: TagStatus | null;
  /** Comment text – set for COMMENT and COMMENT_TAG notifications */
  commentText?: string | null;
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
