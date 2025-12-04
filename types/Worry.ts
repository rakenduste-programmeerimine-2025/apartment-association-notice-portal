import type { CommunityId } from './community';

export type Worry = {
  id: string;
  title: string | null;
  content: string | null;
  created_at: string;

  created_by: string | null;          // user id
  community_id?: string | null;

  // likes
  likesCount?: number;
  hasLiked?: boolean;

  creator_name?: string | null;
};
