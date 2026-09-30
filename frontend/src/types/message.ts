export interface Message {
  id: string;
  channel_id?: string;
  sender_id: string;
  content: string;
  created_at: string;
  user?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
}
