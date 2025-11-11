export type Notice = {
  id: string;
  title: string;
  content: string;
  category: string;
  community_id?: string | null;
  created_by?: string | null;
  updatedAt?: string | null;
  created_at: string;
};
