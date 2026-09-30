import { Router } from 'express';
import { register, login } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { validateAuth } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validateBody(validateAuth), register);
router.post('/login', validateBody(validateAuth), login);

export default router;
