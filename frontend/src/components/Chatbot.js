import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hello! I\'m your course assistant. Ask me about courses, topics, or faculty members. For example: "Tell me about statistics courses" or "Who teaches machine learning?"',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      type: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputText('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: inputText })
      });

      const data = await response.json();

      const botMessage = {
        type: 'bot',
        text: data.response,
        timestamp: new Date(),
        matchingCourses: data.matching_courses
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatBotMessage = (text) => {
    // Simple markdown-like formatting for **bold** text
    return text.split('\n').map((line, index) => (
      <div key={index}>
        {line.split('**').map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
      </div>
    ));
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Course Assistant</h1>
        <Link to="/dashboard">← Back to Majors</Link>
      </div>

      <div style={{ 
        flex: 1, 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f9f9f9'
      }}>
        {/* Messages Area */}
        <div style={{ 
          flex: 1, 
          padding: '20px', 
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {messages.map((message, index) => (
            <div key={index} style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: message.type === 'user' ? '#007bff' : '#e9ecef',
                color: message.type === 'user' ? 'white' : '#333',
                wordWrap: 'break-word'
              }}>
                {message.type === 'bot' ? formatBotMessage(message.text) : message.text}
                <div style={{
                  fontSize: '10px',
                  opacity: 0.7,
                  marginTop: '4px',
                  textAlign: message.type === 'user' ? 'right' : 'left'
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '18px',
                backgroundColor: '#e9ecef',
                color: '#333'
              }}>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span>Thinking</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <span style={{ animation: 'blink 1.4s infinite both' }}>.</span>
                    <span style={{ animation: 'blink 1.4s infinite both', animationDelay: '0.2s' }}>.</span>
                    <span style={{ animation: 'blink 1.4s infinite both', animationDelay: '0.4s' }}>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ 
          padding: '20px', 
          borderTop: '1px solid #ddd',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about courses, topics, or faculty..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '24px',
                outline: 'none',
                fontSize: '14px'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputText.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                cursor: isLoading || !inputText.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !inputText.trim() ? 0.6 : 1
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Chatbot;