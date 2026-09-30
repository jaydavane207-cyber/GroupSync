import React, { createContext, useContext } from 'react';
import { useAppContext } from './AppContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { toast, showToast, unreadNotificationCount } = useAppContext();

  return (
    <NotificationContext.Provider
      value={{
        toast,
        showToast,
        unreadCount: unreadNotificationCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => useContext(NotificationContext);

export default NotificationContext;
