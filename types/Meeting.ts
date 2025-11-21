export type Meeting = {
  id: string;
  title: string;
  description: string;
  meeting_date: string;
  duration: string; // 
  created_by?: string | null;
  community_id?: string | null;
  created_at?: string;
};
