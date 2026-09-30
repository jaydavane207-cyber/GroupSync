import { useAppContext } from '@/context/AppContext';

export const useUser = () => {
  const { user, updateUserProfile, stats } = useAppContext();

  return {
    user,
    stats,
    updateProfile: updateUserProfile,
  };
};

export default useUser;

