import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  if (loading) return <div>Loading majors...</div>;

  return (
    <div>
      <h1>Available Majors</h1>
      <ul>
        {majors.map(major => (
          <li key={major.id}>
            <Link to={`/courses/${major.id}`}>
              {major.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MajorsList;