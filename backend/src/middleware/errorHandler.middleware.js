import { logger } from '../utils/logger.js';

export const errorHandlerMiddleware = (err, req, res, next) => {
  logger.error(err.message, err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR',
    },
  });
};

export default errorHandlerMiddleware;
