import React, { createContext, useContext } from 'react';
import { useAppContext } from './AppContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, updateUserProfile, stats } = useAppContext();

  return (
    <UserContext.Provider value={{ user, updateUserProfile, stats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

export default UserContext;
