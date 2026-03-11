export interface VaultAuthor {
  username: string | null;
  name: string | null;
  profilePicUrl: string | null;
}

export interface Vault {
  id?: string;
  title: string;
  description: string;
  tags: string[];
  mood: string | null;
  location: {
    label: string;
    lat: number;
    lon: number;
  } | null;
  visibility: VaultVisibility;
  audience: VaultAudience;
  allowComments: boolean;
  friendUsername?: string[];
  attachments: VaultAttachment[];
  /** ISO-8601 datetime for scheduled publishing; null means publish immediately */
  scheduledAt: string | null;
  status: "publish" | "draft" | "schedule";
  author?: VaultAuthor;
  createdAt?: string;
  distance?: number;
  likesCount?: number;
  isLiked?: boolean;
  commentsCount?: number;
  impressionsCount?: number;
  topCountries?: string[];
  isPinned?: boolean;
  pinnedAt?: string | null;
}

export type VaultVisibility = "public" | "friends" | "private";
export type VaultAudience = "everyone" | "followers";

export interface VaultAttachment {
  url: string;
  type: "image" | "video";
}

export interface VaultComment {
  id: string;
  vaultId: string;
  text: string;
  author: VaultAuthor;
  createdAt: string;
}
