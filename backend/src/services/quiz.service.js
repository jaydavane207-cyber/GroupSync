export const quizService = {
  async getQuiz(id) {
    return { id, title: 'Sample Quiz', questions: [] };
  },
  async submitQuiz(id, answers) {
    return { passed: true, score: 90 };
  },
};

export default quizService;
