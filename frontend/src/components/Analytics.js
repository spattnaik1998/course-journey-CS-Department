import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/analytics')
      .then(response => response.json())
      .then(data => {
        setAnalyticsData(data.courses);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  const totalViews = analyticsData.reduce((sum, course) => sum + course.views, 0);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Course Analytics</h1>
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Total views: {totalViews} | Courses tracked: {analyticsData.length}
      </p>
      
      <div style={{ width: '100%', height: '400px', marginBottom: '30px' }}>
        <ResponsiveContainer>
          <BarChart data={analyticsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="code" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} views`, 
                props.payload.name
              ]}
            />
            <Bar dataKey="views" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Course Details</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Course Code</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Course Name</th>
              <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>Views</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData
              .sort((a, b) => b.views - a.views)
              .map(course => (
                <tr key={course.code}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{course.code}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{course.name}</td>
                  <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>{course.views}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link to="/">← Back to Majors</Link>
      </div>
    </div>
  );
}

export default Analytics;