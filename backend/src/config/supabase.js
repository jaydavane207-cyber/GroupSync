import { ENV } from './env.js';

export const supabaseServerConfig = {
  url: ENV.SUPABASE_URL,
  serviceKey: ENV.SUPABASE_SERVICE_ROLE_KEY,
};

export default supabaseServerConfig;
