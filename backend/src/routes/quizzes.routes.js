import { Router } from 'express';
import { getQuiz, submitQuiz } from '../controllers/quiz.controller.js';

const router = Router();

router.get('/:id', getQuiz);
router.post('/:id/submit', submitQuiz);

export default router;
