import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FloatingChat from './FloatingChat';

function MajorsList() {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/majors')
      .then(response => response.json())
      .then(data => {
        setMajors(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching majors:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading programs...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Academic Programs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover cutting-edge courses and world-class faculty across our specialized departments
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

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-6 inline-block">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Need Help Choosing?
            </h3>
            <p className="text-gray-600 mb-4">
              Use our course assistant to find the perfect program for you
            </p>
            <span className="text-primary-600 text-sm font-medium">
              💬 Chat assistant available in bottom-right corner
            </span>
          </div>
        </div>
      </div>
      
      <FloatingChat />
    </div>
  );
}

export default MajorsList;