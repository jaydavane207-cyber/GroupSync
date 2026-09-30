import { authService } from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body;
    const user = await authService.register(email, password, full_name);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export default { register, login };
