import { userService } from '../services/user.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.params.id);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
};

export default { getProfile };
