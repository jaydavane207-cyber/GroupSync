import { ENV } from './env';

export const API_CONFIG = {
  baseUrl: ENV.API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_CONFIG;
