import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaTimes } from 'react-icons/fa';

// The URL of your FastAPI backend chat endpoint
const API_URL = 'http://127.0.0.1:8000/chat';

// --- Preset Queries (Unchanged) ---
const presetQueries = [
  "Why was my top crop recommended?",
  "What are the risks for my top recommended crop?",
  "Give me a simple tip for one of these crops.",
  "Which of these 3 crops is most resilient?",
];

// --- SimpleMarkdownRenderer (Unchanged) ---
const SimpleMarkdownRenderer = ({ text }) => {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        let processedLine = line;
        let isBullet = false;
        if (processedLine.startsWith('* ') || processedLine.startsWith('- ')) {
          processedLine = `• ${processedLine.substring(2)}`;
          isBullet = true;
        }
        const parts = processedLine.split(/(\*\*.*?\*\*)/g);
        const renderedLine = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.substring(2, part.length - 2)}</strong>;
          }
          return part;
        });
        return (
          <div 
            key={i} 
            style={{ 
              display: 'block', 
              paddingLeft: isBullet ? '1.25rem' : '0', 
              textIndent: isBullet ? '-1.25rem' : '0', 
              lineHeight: '1.6', 
              minHeight: '1.6em', 
            }}
          >
            {renderedLine.length > 0 ? renderedLine : '\u00A0'}
          </div>
        );
      })}
    </>
  );
};

// --- MODIFIED: Main Component ---
const Chatbot = ({ inputs, predictions, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef(null);

  // Hooks (useEffect) are unchanged...
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setMessages([]); 
    }
  }, [isOpen]);

  // Helper functions (handleSendMessage, etc.) are unchanged...
  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || !inputs || !predictions) return;
    const newUserMessage = { role: 'user', content: messageContent };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setUserInput('');
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({
          user_query: messageContent,
          inputs: inputs,
          predictions: predictions
        }),
      });
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      const botResponse = data.response;
      setMessages([...newMessages, { role: 'assistant', content: botResponse }]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `Sorry, I couldn't connect. Error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const handlePresetClick = (query) => { handleSendMessage(query); };
  const handleCustomSubmit = (e) => { e.preventDefault(); handleSendMessage(userInput); };

  // --- MODIFIED: Render logic ---
  if (!isOpen) {
    return null;
  }
  
  const hasContext = inputs && predictions;

  return (
    // --- MODIFIED: Removed overlay, renamed container class ---
    // The overlay div is gone.
    <div className="chatbot-popup-container">
      
      <button className="chatbot-close-btn" onClick={onClose}>
        <FaTimes />
      </button>

      <h4 className="chatbot-title">
        <FaRobot style={{ marginRight: '0.5rem' }} />
        AgriBot Advisor
      </h4>
      
      {!hasContext ? (
        <div className="chat-window" style={{justifyContent: 'center', alignItems: 'center', display: 'flex'}}>
          <div className="chat-placeholder">
            Get a prediction first to enable the chatbot.
          </div>
        </div>
      ) : (
        <>
          <div className="chat-window" ref={chatWindowRef}>
            {messages.length === 0 && (
              <div className="chat-placeholder">
                Ask a question about your results.
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <span className="chat-icon">
                  {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                </span>
                <div className="chat-bubble">
                  <SimpleMarkdownRenderer text={msg.content} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <span className="chat-icon"><FaRobot /></span>
                <div className="chat-bubble loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <div className="preset-queries">
            {presetQueries.map((query, index) => (
              <button 
                key={index} 
                className="preset-query-btn"
                onClick={() => handlePresetClick(query)}
                disabled={isLoading}
              >
                {query}
              </button>
            ))}
          </div>

          <form className="chat-input-form" onSubmit={handleCustomSubmit}>
            <input
              type="text"
              className="chat-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your custom query..."
              disabled={isLoading}
            />
            <button type="submit" className="chat-send-btn" disabled={isLoading}>
              <FaPaperPlane />
            </button>
          </form>
        </>
      )}
    </div>
    // --- END OF MODIFICATION ---
  );
};

export default Chatbot;