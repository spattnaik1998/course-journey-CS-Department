import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function CoursesList() {
  const { majorId } = useParams();
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      <ul>
        {filteredCourses.map(course => (
          <li key={course.code}>
            <strong>{course.code}:</strong> {course.name}
          </li>
        ))}
      </ul>
      {filteredCourses.length === 0 && searchTerm && (
        <p>No courses found matching "{searchTerm}"</p>
      )}
      <Link to="/">← Back to Majors</Link>
    </div>
  );
}

export default CoursesList;