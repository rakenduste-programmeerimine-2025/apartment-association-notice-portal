export type Notice = {
  id: string;
  title: string;
  content: string;
  category: string;
  community_id?: string | null;
  created_by?: string | null;
  updatedAt?: string | null;
  created_at: string;

  likesCount?: number;   // how many likes this notice has
  hasLiked?: boolean;    // did current user like this notice
};
