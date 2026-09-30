import React, { createContext, useContext } from 'react';
import { useAppContext } from './AppContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isInitializingAuth, login, signup, logout } = useAppContext();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializingAuth,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider or AppProvider');
  }
  return context;
};

export default AuthContext;
