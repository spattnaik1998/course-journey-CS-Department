import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MajorsList from './components/MajorsList';
import CoursesList from './components/CoursesList';
import Analytics from './components/Analytics';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MajorsList />} />
          <Route path="/courses/:majorId" element={<CoursesList />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/assistant" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;