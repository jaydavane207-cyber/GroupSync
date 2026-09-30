import { useAppContext } from '@/context/AppContext';

export const useToast = () => {
  const { toast, showToast } = useAppContext();

  return {
    toast,
    showToast,
    success: (msg) => showToast(msg, 'success'),
    error: (msg) => showToast(msg, 'error'),
  };
};

export default useToast;

