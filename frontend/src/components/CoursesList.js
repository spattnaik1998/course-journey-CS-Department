import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FacultyModal from './FacultyModal';
import FloatingChat from './FloatingChat';
import Faculty from './Faculty';
import jsPDF from 'jspdf';

function CoursesList() {
  const { majorId } = useParams();
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [modalFaculty, setModalFaculty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    fetch(`http://localhost:8000/courses/${majorId}`)
      .then(response => response.json())
      .then(data => {
        setCoursesData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
  }, [majorId]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading courses...</p>
      </div>
    </div>
  );
  
  if (!coursesData) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-4">⚠️</div>
        <p className="text-gray-600 font-medium">Error loading courses</p>
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
          ← Back to Majors
        </Link>
      </div>
    </div>
  );

  const filteredCourses = coursesData.courses.filter(course =>
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpanded = (courseCode) => {
    const newExpandedCourse = expandedCourse === courseCode ? null : courseCode;
    setExpandedCourse(newExpandedCourse);
    
    // Track view when course is expanded (opened)
    if (newExpandedCourse === courseCode) {
      fetch(`http://localhost:8000/courses/${courseCode}/view`, {
        method: 'POST'
      }).catch(error => {
        console.error('Error tracking view:', error);
      });
    }
  };

  const openFacultyModal = (faculty) => {
    setModalFaculty(faculty);
    setIsModalOpen(true);
  };

  const closeFacultyModal = () => {
    setIsModalOpen(false);
    setModalFaculty(null);
  };

  const addToPlan = (course) => {
    if (!selectedCourses.some(c => c.code === course.code)) {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const removeFromPlan = (courseCode) => {
    setSelectedCourses(selectedCourses.filter(c => c.code !== courseCode));
  };

  const downloadPlanAsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('My Course Plan', 20, 30);
    
    doc.setFontSize(14);
    doc.text(`Major: ${coursesData.major}`, 20, 50);
    
    let yPosition = 70;
    selectedCourses.forEach((course, index) => {
      doc.setFontSize(12);
      doc.text(`${course.code}: ${course.name}`, 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Credits: ${course.credits} | Semester: ${course.semester}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Faculty: ${course.faculty.name}`, 20, yPosition);
      yPosition += 15;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
    });
    
    doc.save('course-plan.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header with Department Name */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {coursesData.major}
            </h1>
            <p className="text-gray-600">
              Explore courses and faculty in this department
            </p>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'courses' 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Courses
              </button>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === 'faculty' 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                Faculty
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' ? (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 lg:flex-[2]">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses by code or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Courses List */}
              <div className="space-y-4">
                {filteredCourses.map(course => (
                  <div key={course.code} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div 
                          onClick={() => toggleExpanded(course.code)}
                          className="cursor-pointer flex-1 group"
                        >
                          <div className="flex items-center">
                            <span className="text-sm font-mono bg-primary-100 text-primary-800 px-2 py-1 rounded mr-3">
                              {course.code}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {course.name}
                            </h3>
                            <div className="ml-auto text-gray-400 group-hover:text-primary-500 transition-colors">
                              {expandedCourse === course.code ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => addToPlan(course)}
                          disabled={selectedCourses.some(c => c.code === course.code)}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedCourses.some(c => c.code === course.code)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                        >
                          {selectedCourses.some(c => c.code === course.code) ? (
                            <>
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Added
                            </>
                          ) : (
                            'Add to Plan'
                          )}
                        </button>
                      </div>
                      
                      {expandedCourse === course.code && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-down">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                              <p className="text-gray-600 leading-relaxed">{course.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-1">Credits</h4>
                                <p className="text-2xl font-bold text-primary-600">{course.credits}</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-1">Semester</h4>
                                <p className="text-lg font-semibold text-gray-700">{course.semester}</p>
                              </div>
                            </div>
                            
                            <div className="bg-secondary-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Instructor</h4>
                              <button
                                onClick={() => openFacultyModal(course.faculty)}
                                className="text-primary-600 hover:text-primary-700 font-medium underline"
                              >
                                {course.faculty.name}
                              </button>
                              <p className="text-sm text-gray-500 mt-1">
                                Click for contact details
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.5-1.007-6-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p className="text-gray-500 text-lg">No courses found matching "{searchTerm}"</p>
                  <p className="text-gray-400 text-sm">Try adjusting your search terms</p>
                </div>
              )}
            </div>

            {/* Sidebar - My Plan */}
            <div className="lg:flex-1 lg:max-w-sm">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-6">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Plan
                  </h3>
                  
                  {selectedCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-8 w-8 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-gray-500 text-sm">No courses selected yet</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Add to Plan" on courses</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 mb-4">
                        {selectedCourses.map(course => (
                          <div key={course.code} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{course.code}</div>
                              <div className="text-xs text-gray-500">{course.credits} credits</div>
                            </div>
                            <button
                              onClick={() => removeFromPlan(course.code)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm text-gray-600 mb-3">
                          Total: {selectedCourses.reduce((sum, course) => sum + course.credits, 0)} credits
                        </div>
                        <button
                          onClick={downloadPlanAsPDF}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Faculty />
        )}

        {/* Back to Majors */}
        <div className="mt-8 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Programs
          </Link>
        </div>
      </div>
      
      <FacultyModal 
        faculty={modalFaculty}
        isOpen={isModalOpen}
        onClose={closeFacultyModal}
      />
      <FloatingChat />
    </div>
  );
}

export default CoursesList;