import { AppError } from '../utils/errorHandler.js';

export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    const error = validatorFn(req.body);
    if (error) {
      return next(new AppError(error, 400, 'VALIDATION_ERROR'));
    }
    next();
  };
};

export default validateBody;
