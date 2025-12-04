import type { CommunityId } from './community';

export type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;
  created_by?: string | null;
  community_id?: CommunityId | null;

  // likes
  likesCount?: number;   // how many likes this worry has
  hasLiked?: boolean;    // whether current user has liked it
};
