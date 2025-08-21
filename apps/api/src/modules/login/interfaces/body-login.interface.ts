export interface ILoginBody {
  grant_type: string;
  client_secret: string;
  client_id: string;
  username?: string;
  password?: string;
  refresh_token?: string;
}