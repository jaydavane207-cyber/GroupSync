import { teamService } from '../services/team.service.js';

export const getTeams = async (req, res, next) => {
  try {
    const teams = await teamService.getAll();
    res.json({ data: teams });
  } catch (err) {
    next(err);
  }
};

export default { getTeams };
