import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Faculty() {
  const { majorId } = useParams();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/faculty/${majorId}`)
      .then(response => response.json())
      .then(data => {
        setFacultyData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching faculty:', error);
        setLoading(false);
      });
  }, [majorId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading faculty...</p>
      </div>
    </div>
  );
  
  if (!facultyData) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-gray-600 font-medium">Error loading faculty</p>
        <Link to="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
          ← Back to Majors
        </Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Faculty Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {facultyData.faculty.map((faculty, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            {/* Faculty Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {faculty.name}
                </h2>
                <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>

            {/* Courses Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Courses Taught
              </h3>
              <div className="space-y-2">
                {faculty.courses.map((course, courseIndex) => (
                  <div key={courseIndex} className="bg-primary-50 rounded-lg px-3 py-2">
                    <span className="text-primary-700 font-medium text-sm">
                      {course}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational Background */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Education
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {faculty.educational_background}
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Contact
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a 
                    href={`mailto:${faculty.email}`} 
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                  >
                    {faculty.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600 text-sm">
                    {faculty.office_hours}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Faculty;