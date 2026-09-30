import { ENV } from '../config/env.js';

export const verifyToken = (token) => {
  // Token verification placeholder
  if (!token) throw new Error('No token provided');
  return { userId: 'mock-user-id' };
};

export default { verifyToken };
