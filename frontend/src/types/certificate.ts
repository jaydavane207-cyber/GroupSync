export interface Certificate {
  id: string;
  user_id: string;
  title: string;
  issuer: string;
  issue_date: string;
  credential_url?: string;
  verified: boolean;
  file_url?: string;
}
