import { useState, useCallback } from 'react';
import { quizService } from '../lib/services/quizService';
import { useAppContext } from '@/context/AppContext';

export const useQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useAppContext();

  const getQuiz = useCallback(async (quizId) => {
    try {
      setLoading(true);
      return await quizService.getQuizById(quizId);
    } catch (err) {
      setError(err.message);
      showToast?.(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const submitQuiz = async (quizId, answers) => {
    try {
      setLoading(true);
      return await quizService.submitQuiz(quizId, answers);
    } catch (err) {
      setError(err.message);
      showToast?.(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getQuiz,
    submitQuiz,
    loading,
    error,
  };
};

export default useQuiz;

