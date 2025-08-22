import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FacultyModal from './FacultyModal';

function CoursesList() {
  const { majorId } = useParams();
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [modalFaculty, setModalFaculty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    setExpandedCourse(expandedCourse === courseCode ? null : courseCode);
  };

  const openFacultyModal = (faculty) => {
    setModalFaculty(faculty);
    setIsModalOpen(true);
  };

  const closeFacultyModal = () => {
    setIsModalOpen(false);
    setModalFaculty(null);
  };

  return (
    <div>
      <h1>Courses for {coursesData.major}</h1>
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
            cursor: 'pointer',
            backgroundColor: expandedCourse === course.code ? '#f9f9f9' : 'white'
          }}>
            <div onClick={() => toggleExpanded(course.code)}>
              <strong>{course.code}:</strong> {course.name}
              <span style={{ float: 'right', color: '#666' }}>
                {expandedCourse === course.code ? '−' : '+'}
              </span>
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
      {filteredCourses.length === 0 && searchTerm && (
        <p>No courses found matching "{searchTerm}"</p>
      )}
      <Link to="/">← Back to Majors</Link>
      
      <FacultyModal 
        faculty={modalFaculty}
        isOpen={isModalOpen}
        onClose={closeFacultyModal}
      />
    </div>
  );
}

export default CoursesList;