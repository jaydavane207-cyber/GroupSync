import { Router } from 'express';
import { getMessages } from '../controllers/message.controller.js';

const router = Router();

router.get('/channel/:channel', getMessages);

export default router;
