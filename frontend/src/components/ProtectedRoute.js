import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true = authenticated, false = not authenticated
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const userUID = localStorage.getItem('userUID');
      
      if (!userUID) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        // Verify the UID is still valid by calling the welcome endpoint
        const response = await fetch(`${process.env.REACT_APP_API_URL}/welcome/${userUID}`);
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Invalid UID, remove from localStorage
          localStorage.removeItem('userUID');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // On network error, assume not authenticated for security
        localStorage.removeItem('userUID');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;