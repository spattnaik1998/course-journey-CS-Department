import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/majors`);
        const data = await response.json();
        setMajors(data);
      } catch (error) {
        console.error('Error fetching majors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMajors();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-gray-900">CS Department</div>
            {user && (
              <div className="text-gray-600">Welcome, {user.name}!</div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/user-dashboard" 
              className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              My Registrations
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

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Computer Science Department
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our specialized programs and start building your academic journey
          </p>
        </div>

        {/* Majors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {majors.map(major => (
            <Link 
              key={major.id} 
              to={`/courses/${major.id}`}
              className="group block"
            >
              <div className="card group-hover:shadow-xl group-hover:-translate-y-1 bg-white border border-gray-200 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="text-primary-500 group-hover:text-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {major.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  Explore courses, faculty, and build your academic plan
                </p>
                
                <div className="flex items-center text-primary-600 font-medium">
                  <span className="text-sm">View Courses</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center mb-8">
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Course Assistant</h3>
              <p className="text-gray-600 text-sm">Get personalized course recommendations and guidance</p>
            </div>
          </Link>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-6 inline-block">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help Getting Started?
            </h3>
            <p className="text-gray-600 mb-4">
              Use our AI assistant to find the perfect courses for your goals
            </p>
            <Link 
              to="/assistant"
              className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
            >
              💬 Start a conversation with our AI assistant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;