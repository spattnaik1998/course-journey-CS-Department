import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function Faculty() {
  const { majorId } = useParams();
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/faculty/${majorId}`)
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

  if (loading) return <div>Loading faculty...</div>;
  if (!facultyData) return <div>Error loading faculty</div>;

  return (
    <div>
      <h1>Faculty - {facultyData.major}</h1>
      
      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        marginBottom: '30px'
      }}>
        {facultyData.faculty.map((faculty, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {/* Faculty Name */}
            <h2 style={{ 
              marginTop: 0, 
              marginBottom: '15px', 
              color: '#333',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>
              {faculty.name}
            </h2>

            {/* Courses Section */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                marginBottom: '8px', 
                color: '#555',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Course(s) Taught:
              </h3>
              <ul style={{ 
                marginLeft: '20px', 
                marginTop: 0,
                marginBottom: 0
              }}>
                {faculty.courses.map((course, courseIndex) => (
                  <li key={courseIndex} style={{ 
                    marginBottom: '4px',
                    color: '#007bff',
                    fontWeight: '500'
                  }}>
                    {course}
                  </li>
                ))}
              </ul>
            </div>

            {/* Educational Background */}
            <div style={{ marginBottom: '15px' }}>
              <h3 style={{ 
                marginBottom: '8px', 
                color: '#555',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Educational Background:
              </h3>
              <p style={{ 
                marginTop: 0,
                marginBottom: 0,
                lineHeight: '1.5',
                color: '#666'
              }}>
                {faculty.educational_background}
              </p>
            </div>

            {/* Contact Information */}
            <div style={{ 
              borderTop: '1px solid #eee',
              paddingTop: '15px',
              fontSize: '14px',
              color: '#666'
            }}>
              <div style={{ marginBottom: '4px' }}>
                <strong>Email:</strong> 
                <a href={`mailto:${faculty.email}`} style={{ 
                  marginLeft: '8px', 
                  color: '#007bff',
                  textDecoration: 'none'
                }}>
                  {faculty.email}
                </a>
              </div>
              <div>
                <strong>Office Hours:</strong> {faculty.office_hours}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link to="/">← Back to Majors</Link>
    </div>
  );
}

export default Faculty;