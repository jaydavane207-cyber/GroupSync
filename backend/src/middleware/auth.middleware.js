import { AppError } from '../utils/errorHandler.js';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No authorization token provided', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  req.user = { id: 'mock-auth-id', token };
  next();
};

export default authMiddleware;
