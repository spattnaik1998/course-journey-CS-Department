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
  const [courseSummaries, setCourseSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});
  const [courseRecommendations, setCourseRecommendations] = useState({});
  const [loadingRecommendations, setLoadingRecommendations] = useState({});
  const [backendSelectedCourses, setBackendSelectedCourses] = useState([]);
  const [courseLimit, setCourseLimit] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/courses/${majorId}`)
      .then(response => response.json())
      .then(data => {
        setCoursesData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
        setLoading(false);
      });
      
    // Fetch selected courses from backend
    fetchSelectedCourses();
  }, [majorId]);

  const fetchSelectedCourses = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/selected-courses`);
      if (response.ok) {
        const data = await response.json();
        setBackendSelectedCourses(data.selected_courses);
        setCourseLimit(data.course_limit || 3);
      }
    } catch (error) {
      console.error('Error fetching selected courses:', error);
    }
  };

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
      fetch(`${process.env.REACT_APP_API_URL}/courses/${courseCode}/view`, {
        method: 'POST'
      }).catch(error => {
        console.error('Error tracking view:', error);
      });
      
      // Fetch recommendations when course is expanded
      fetchRecommendations(courseCode);
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

  const addToPlan = async (course) => {
    try {
      setErrorMessage(''); // Clear any previous errors
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/select-course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_code: course.code })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local state with backend data
        setBackendSelectedCourses(data.selected_courses);
        setCourseLimit(data.course_limit || 3);
        // Update old selectedCourses for backward compatibility
        setSelectedCourses(data.selected_courses);
      } else {
        // Show error message from backend
        setErrorMessage(data.detail || 'Failed to add course');
        setTimeout(() => setErrorMessage(''), 5000); // Clear error after 5 seconds
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setErrorMessage('Failed to add course. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const removeFromPlan = async (courseCode) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/remove-course/${courseCode}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local state with backend data
        setBackendSelectedCourses(data.selected_courses);
        setCourseLimit(data.course_limit || 3);
        // Update old selectedCourses for backward compatibility
        setSelectedCourses(data.selected_courses);
      }
    } catch (error) {
      console.error('Error removing course:', error);
    }
  };

  // Helper function to check if a course is selected
  const isCourseSelected = (courseCode) => {
    return backendSelectedCourses.some(course => course.code === courseCode);
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
      doc.text(`Credits: ${course.credits}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Faculty: ${course.faculty}`, 20, yPosition);
      yPosition += 15;
      
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
    });
    
    doc.save('course-plan.pdf');
  };

  const summarizeCourse = async (course) => {
    const courseCode = course.code;
    
    setLoadingSummaries(prev => ({ ...prev, [courseCode]: true }));
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course_description: course.description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }
      
      const data = await response.json();
      setCourseSummaries(prev => ({ ...prev, [courseCode]: data.summary }));
      
    } catch (error) {
      console.error('Error summarizing course:', error);
      setCourseSummaries(prev => ({ 
        ...prev, 
        [courseCode]: 'Unable to generate summary. Please try again.' 
      }));
    } finally {
      setLoadingSummaries(prev => ({ ...prev, [courseCode]: false }));
    }
  };

  const fetchRecommendations = async (courseCode) => {
    setLoadingRecommendations(prev => ({ ...prev, [courseCode]: true }));
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/recommend/${courseCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      setCourseRecommendations(prev => ({ ...prev, [courseCode]: data.recommendations }));
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setCourseRecommendations(prev => ({ ...prev, [courseCode]: [] }));
    } finally {
      setLoadingRecommendations(prev => ({ ...prev, [courseCode]: false }));
    }
  };

  const handleRecommendationClick = (recommendedCourse) => {
    // Find the course in the current courses list and expand it
    const courseExists = filteredCourses.find(course => course.code === recommendedCourse.code);
    if (courseExists) {
      setExpandedCourse(recommendedCourse.code);
      fetchRecommendations(recommendedCourse.code);
    }
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

        {/* Error Message Display */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 6.5c-.77.833-.192 2.5 1.732 2.5z" />
              </svg>
              {errorMessage}
            </div>
          </div>
        )}

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
                          disabled={isCourseSelected(course.code)}
                          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                            isCourseSelected(course.code)
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-primary-600 hover:bg-primary-700 text-white'
                          }`}
                        >
                          {isCourseSelected(course.code) ? (
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
                            
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-1">Credits</h4>
                              <p className="text-2xl font-bold text-primary-600">{course.credits}</p>
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

                            {/* Course Summarizer */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900">AI Course Summary</h4>
                                <button
                                  onClick={() => summarizeCourse(course)}
                                  disabled={loadingSummaries[course.code]}
                                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    loadingSummaries[course.code]
                                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                  }`}
                                >
                                  {loadingSummaries[course.code] ? (
                                    <div className="flex items-center">
                                      <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Summarizing...
                                    </div>
                                  ) : (
                                    'Summarize Course'
                                  )}
                                </button>
                              </div>
                              
                              {courseSummaries[course.code] && (
                                <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                                  <p className="text-sm text-gray-700 leading-relaxed">
                                    {courseSummaries[course.code]}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Course Recommendations */}
                            <div className="bg-green-50 rounded-lg p-4">
                              <h4 className="font-medium text-gray-900 mb-3">Recommended Courses</h4>
                              
                              {loadingRecommendations[course.code] ? (
                                <div className="flex items-center text-gray-600">
                                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Loading recommendations...
                                </div>
                              ) : courseRecommendations[course.code] && courseRecommendations[course.code].length > 0 ? (
                                <div className="space-y-2">
                                  {courseRecommendations[course.code].map((rec, index) => (
                                    <div key={rec.code} className="bg-white rounded-lg p-3 border border-green-200 hover:border-green-300 transition-colors">
                                      <button
                                        onClick={() => handleRecommendationClick(rec)}
                                        className="w-full text-left"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <span className="text-sm font-mono bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                                              {rec.code}
                                            </span>
                                            <span className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                                              {rec.name}
                                            </span>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {rec.major}
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                          {rec.description}
                                        </p>
                                      </button>
                                    </div>
                                  ))}
                                  <p className="text-xs text-gray-500 mt-2">
                                    💡 Click on a course to see its details
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-600">
                                  No recommendations available.
                                </p>
                              )}
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
                  
                  {backendSelectedCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-8 w-8 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <p className="text-gray-500 text-sm">No courses selected yet</p>
                      <p className="text-gray-400 text-xs mt-1">Click "Add to Plan" on courses</p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 text-sm">Selected Courses</h4>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            backendSelectedCourses.length >= courseLimit ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {backendSelectedCourses.length}/{courseLimit}
                          </div>
                        </div>
                        <div className="space-y-2">
                          {backendSelectedCourses.map(course => (
                            <div key={course.code} className="bg-gray-50 rounded p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{course.code}</div>
                                  <div className="text-xs text-gray-600">{course.name}</div>
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
                            </div>
                          ))}
                        </div>
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