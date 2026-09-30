import { Router } from 'express';
import { getTeams } from '../controllers/team.controller.js';

const router = Router();

router.get('/', getTeams);

export default router;
