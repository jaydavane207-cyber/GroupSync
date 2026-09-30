import { useAppContext } from '@/context/AppContext';
import { authService } from '../lib/services/authService';

export const useAuth = () => {
  const { user, isInitializingAuth, login, signup, logout } = useAppContext();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: isInitializingAuth,
    login,
    signup,
    logout,
    loginWithGoogle: authService.loginWithGoogle,
  };
};

export default useAuth;

