import { quizService } from '../services/quiz.service.js';

export const getQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.getQuiz(req.params.id);
    res.json({ data: quiz });
  } catch (err) {
    next(err);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const result = await quizService.submitQuiz(req.params.id, req.body.answers);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
};

export default { getQuiz, submitQuiz };
