import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthentication = useCallback(async (skipCache = false) => {
    const userUID = localStorage.getItem('userUID');
    
    if (!userUID) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }

    // If we already have user data and not forcing refresh, skip API call
    if (!skipCache && user && user.uid === userUID) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/welcome/${userUID}`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser({
          uid: userData.uid,
          name: userData.user_name,
          hasRegisteredCourses: userData.has_registered_courses || false
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else if (response.status === 401 || response.status === 404) {
        // Invalid UID or user not found
        localStorage.removeItem('userUID');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      } else {
        // Server error, maintain existing auth state if we have user data
        if (user && user.uid === userUID) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
        return isAuthenticated;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Network error - maintain existing auth state if we have user data
      if (user && user.uid === userUID) {
        setIsAuthenticated(true);
      } else {
        // No existing user data, assume authenticated if UID exists
        setIsAuthenticated(true);
      }
      setIsLoading(false);
      return isAuthenticated;
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('userUID', userData.uid);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('userUID');
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = () => {
    checkAuthentication(true);
  };

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    checkAuthentication
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;