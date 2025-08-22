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

  if (loading) return <div>Loading courses...</div>;
  if (!coursesData) return <div>Error loading courses</div>;

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
    <div>
      {/* Header with Department Name */}
      <div style={{ marginBottom: '20px' }}>
        <h1>{coursesData.major}</h1>
        
        {/* Tab Navigation */}
        <div style={{ 
          borderBottom: '2px solid #eee',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('courses')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: activeTab === 'courses' ? '#007bff' : 'transparent',
              color: activeTab === 'courses' ? 'white' : '#007bff',
              border: '2px solid #007bff',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'courses' ? 'bold' : 'normal'
            }}
          >
            Courses
          </button>
          <button
            onClick={() => setActiveTab('faculty')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'faculty' ? '#007bff' : 'transparent',
              color: activeTab === 'faculty' ? 'white' : '#007bff',
              border: '2px solid #007bff',
              borderBottom: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'faculty' ? 'bold' : 'normal'
            }}
          >
            Faculty
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' ? (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ flex: '2' }}>
        <input
          type="text"
          placeholder="Search courses by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '20px', padding: '8px', width: '300px' }}
        />
        <div>
          {filteredCourses.map(course => (
            <div key={course.code} style={{ 
              border: '1px solid #ccc', 
              marginBottom: '10px', 
              padding: '15px',
              backgroundColor: expandedCourse === course.code ? '#f9f9f9' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div 
                  onClick={() => toggleExpanded(course.code)}
                  style={{ cursor: 'pointer', flex: 1 }}
                >
                  <strong>{course.code}:</strong> {course.name}
                  <span style={{ marginLeft: '10px', color: '#666' }}>
                    {expandedCourse === course.code ? '−' : '+'}
                  </span>
                </div>
                <button
                  onClick={() => addToPlan(course)}
                  disabled={selectedCourses.some(c => c.code === course.code)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: selectedCourses.some(c => c.code === course.code) ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedCourses.some(c => c.code === course.code) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {selectedCourses.some(c => c.code === course.code) ? 'Added' : 'Add to Plan'}
                </button>
              </div>
              {expandedCourse === course.code && (
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                  <p><strong>Description:</strong> {course.description}</p>
                  <p><strong>Credits:</strong> {course.credits}</p>
                  <p><strong>Semester:</strong> {course.semester}</p>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 5px 0' }}><strong>Faculty:</strong> 
                      <span 
                        onClick={() => openFacultyModal(course.faculty)}
                        style={{ 
                          marginLeft: '8px', 
                          color: '#0066cc', 
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {course.faculty.name}
                      </span>
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      Click name for contact details
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        flex: '1', 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        position: 'sticky',
        top: '20px',
        height: 'fit-content'
      }}>
        <h3>My Plan</h3>
        {selectedCourses.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No courses selected yet</p>
        ) : (
          <>
            <div style={{ marginBottom: '15px' }}>
              {selectedCourses.map(course => (
                <div key={course.code} style={{ 
                  backgroundColor: 'white', 
                  padding: '10px', 
                  marginBottom: '8px', 
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div><strong>{course.code}</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{course.credits} credits</div>
                  </div>
                  <button
                    onClick={() => removeFromPlan(course.code)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={downloadPlanAsPDF}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Download Plan as PDF
            </button>
          </>
        )}
      </div>
      
          {filteredCourses.length === 0 && searchTerm && (
            <p>No courses found matching "{searchTerm}"</p>
          )}
          <Link to="/">← Back to Majors</Link>
        </div>
      ) : (
        <Faculty />
      )}
      
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