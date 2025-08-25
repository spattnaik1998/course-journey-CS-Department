import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  const [userRegistrations, setUserRegistrations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      const userUID = localStorage.getItem('userUID');
      
      if (!userUID) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/user-registrations/${userUID}`);
        
        if (response.ok) {
          const data = await response.json();
          setUserRegistrations(data);
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to load registrations');
        }
      } catch (error) {
        console.error('Error fetching user registrations:', error);
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserRegistrations();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userUID');
    navigate('/');
  };

  const handleClearRegistrations = async () => {
    const userUID = localStorage.getItem('userUID');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user-registrations/${userUID}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUserRegistrations(prev => ({
          ...prev,
          registered_courses: [],
          total_courses: 0,
          registration_status: 'pending'
        }));
      }
    } catch (error) {
      console.error('Error clearing registrations:', error);
    }
  };

  const calculateTotalCredits = () => {
    if (!userRegistrations?.registered_courses) return 0;
    return userRegistrations.registered_courses.reduce((total, course) => total + (course.credits || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
              <button 
                onClick={handleLogout}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-gray-900">My Course Dashboard</div>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Browse Programs
            </Link>
            <Link 
              to="/analytics" 
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              Analytics
            </Link>
            <Link 
              to="/assistant" 
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              AI Assistant
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {userRegistrations?.user_name}!
              </h1>
              <p className="text-gray-600 mb-4">
                Here's your course registration summary
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {userRegistrations?.total_courses || 0}
                  </div>
                  <div className="text-sm text-gray-500">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {calculateTotalCredits()}
                  </div>
                  <div className="text-sm text-gray-500">Credits</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    userRegistrations?.registration_status === 'completed' 
                      ? 'text-green-600' 
                      : 'text-orange-600'
                  }`}>
                    {userRegistrations?.registration_status === 'completed' 
                      ? '✓' 
                      : '⏳'
                    }
                  </div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
            </div>
            <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Course Registrations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Registered Courses</h2>
            {userRegistrations?.total_courses > 0 && (
              <div className="flex space-x-4">
                <button
                  onClick={handleClearRegistrations}
                  className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
                >
                  Clear Registrations
                </button>
                <Link 
                  to="/dashboard"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                >
                  Add More Courses
                </Link>
              </div>
            )}
          </div>

          {userRegistrations?.registered_courses?.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Course Registrations Yet</h3>
              <p className="text-gray-600 mb-6">
                Start by exploring our programs and selecting courses that match your interests
              </p>
              <Link 
                to="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Programs
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userRegistrations.registered_courses.map((course, index) => (
                <div key={course.code || index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-mono bg-primary-100 text-primary-800 px-3 py-1 rounded mr-3">
                          {course.code}
                        </span>
                        <h3 className="text-xl font-semibold text-gray-900">{course.name}</h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {course.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700">Credits</div>
                          <div className="text-lg font-bold text-primary-600">{course.credits}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700">Faculty</div>
                          <div className="text-sm font-medium text-gray-900">{course.faculty}</div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700">Department</div>
                          <div className="text-sm font-medium text-gray-900">{course.major}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/dashboard" className="group block">
            <div className="bg-white rounded-lg shadow-md p-6 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Programs</h3>
              <p className="text-gray-600 text-sm">Explore more courses and programs</p>
            </div>
          </Link>

          <Link to="/analytics" className="group block">
            <div className="bg-white rounded-lg shadow-md p-6 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Analytics</h3>
              <p className="text-gray-600 text-sm">View course popularity and statistics</p>
            </div>
          </Link>

          <Link to="/assistant" className="group block">
            <div className="bg-white rounded-lg shadow-md p-6 group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-gray-600 text-sm">Get help with course selection and planning</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;