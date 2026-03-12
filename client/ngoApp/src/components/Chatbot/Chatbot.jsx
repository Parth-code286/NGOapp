import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([
    { role: 'assistant', content: 'Hello! I am the ImpactHub AI. How can I help you with the platform today? 🏮' }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message };
    setHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: history.slice(-5) }) // Send last 5 messages for context
      });

      const data = await res.json();
      if (res.ok) {
        setHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    } catch (err) {
      setHistory(prev => [...prev, { role: 'assistant', content: 'Connection error. Is the server running?' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chatbot-wrapper ${isOpen ? 'is-open' : ''}`}>
      {/* Chat Window */}
      <div className="chatbot-window">
        <div className="chatbot-header">
          <div className="chatbot-title">
            <span className="chatbot-icon">🤖</span>
            <div>
              <h4>ImpactHub AI</h4>
              <p>Project Assistant</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>

        <div className="chatbot-messages">
          {history.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="message assistant loading">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form className="chatbot-input" onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Ask about ImpactHub..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" disabled={!message.trim() || loading}>
            {loading ? '...' : '▶'}
          </button>
        </form>
      </div>

      {/* Floating Toggle Button */}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;
