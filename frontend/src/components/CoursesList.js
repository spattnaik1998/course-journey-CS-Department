import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function CoursesList() {
  const { majorId } = useParams();
  const [coursesData, setCoursesData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <h1>Courses for {coursesData.major}</h1>
      <ul>
        {coursesData.courses.map(course => (
          <li key={course.code}>
            <strong>{course.code}:</strong> {course.name}
          </li>
        ))}
      </ul>
      <Link to="/">← Back to Majors</Link>
    </div>
  );
}

export default CoursesList;