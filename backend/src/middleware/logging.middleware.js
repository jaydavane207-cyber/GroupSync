import { logger } from '../utils/logger.js';

export const loggingMiddleware = (req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
};

export default loggingMiddleware;
