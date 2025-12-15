// context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AccountService from '../services/account_service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra trạng thái đăng nhập khi khởi động
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AccountService.checkAuthStatus();
      if (authStatus.isAuthenticated) {
        setIsAuthenticated(true);
        setCurrentUser(authStatus.user);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData) => {
    AccountService.saveLoginData(userData);
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const logout = () => {
    AccountService.clearLoginData();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentUser,
      isLoading,
      login,
      logout,
      checkAuthStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);