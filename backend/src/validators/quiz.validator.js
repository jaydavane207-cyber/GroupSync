export const validateQuiz = (data) => {
  if (!data.quiz_id) return 'Quiz ID is required.';
  if (!data.answers || typeof data.answers !== 'object') return 'Quiz answers object is required.';
  return null;
};

export default validateQuiz;
