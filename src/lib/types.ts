
export type Profile = {
  id: string;
  username: string;
  avatar_url: string;
  plan: 'Free' | 'Pro';
  usage: number;
};

export type Activity = {
  id: string;
  created_at: string;
  type: 'EDIT' | 'COMMENT' | 'SHARE' | 'JOIN';
  document_id?: string;
  document_title?: string;
  user_id?: string;
  user_name?: string;
};