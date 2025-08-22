import React from 'react';

function FacultyModal({ faculty, isOpen, onClose }) {
  if (!isOpen || !faculty) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '15px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          ×
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
          Faculty Information
        </h2>
        
        <div style={{ lineHeight: '1.6' }}>
          <p><strong>Name:</strong> {faculty.name}</p>
          <p><strong>Email:</strong> 
            <a href={`mailto:${faculty.email}`} style={{ marginLeft: '8px', color: '#0066cc' }}>
              {faculty.email}
            </a>
          </p>
          <p><strong>Office Hours:</strong> {faculty.office_hours}</p>
        </div>
      </div>
    </div>
  );
}

export default FacultyModal;