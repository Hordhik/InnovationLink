// FILE: src/Inbox/Inbox.jsx

import React, { useState, useEffect, useRef } from 'react';
import UserList from './UserList';
import Message from './Message';
import MessageInput from './MessageInput';
import './Inbox.css';

// --- Mock Data ---
const allUsers = [
    { id: 1, name: 'Ishwar', company: 'UI2DEV' },
    { id: 2, name: 'Sravan Kumar', company: 'Innovation LinK' },
    { id: 3, name: 'Manikant Reddy', company: 'Innovation LinK' },
    { id: 4, name: 'John Doe', company: 'Tech Corp' },
    { id: 5, name: 'Jane Smith', company: 'Design Studio' },
];

const allMessages = {
    1: [ 
        { id: 1, text: "One of India's most prestigious startup events, organized by AICRA, bringing together.", time: '8:30 AM', isSentByMe: false, sender: { name: 'Ishwar' } },
        { id: 2, text: "Absolutely! I've heard great things about it.", time: '8:31 AM', isSentByMe: true, sender: { name: 'Chandra Sekhar' } },
        { id: 3, text: "Perfect. I'll get on that right away.", time: '8:32 AM', isSentByMe: false, sender: { name: 'Ishwar' } },
    ],
    2: [ 
        { id: 1, text: "Hey! Do you have the latest financial report?", time: 'Yesterday', isSentByMe: false, sender: { name: 'Sravan Kumar' } },
        { id: 2, text: "Yes, sending it over now.", time: 'Yesterday', isSentByMe: true, sender: { name: 'Chandra Sekhar' } },
    ],
    3: [], 
    4: [{ id: 1, text: "Let's connect next week to discuss the new feature.", time: 'Mon', isSentByMe: false, sender: { name: 'John Doe' } }],
    5: [{ id: 1, text: "The new design mockups are ready for review.", time: 'Mon', isSentByMe: false, sender: { name: 'Jane Smith' } }],
};


const Inbox = () => {
  // const [users, setUsers] = useState(allUsers);
  const [activeUser, setActiveUser] = useState(allUsers[0]);
  const [messages, setMessages] = useState(allMessages[activeUser.id] || []);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMessages(allMessages[activeUser.id] || []);
  }, [activeUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = (text) => {
    const newMessage = {
        id: (messages.length > 0 ? Math.max(...messages.map(m => m.id)) : 0) + 1,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSentByMe: true,
        sender: { name: 'Chandra Sekhar' }
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    allMessages[activeUser.id] = updatedMessages;
  };

  const handleDeleteMessage = (messageId) => {
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      allMessages[activeUser.id] = updatedMessages;
  };

  const filteredUsers = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="inbox-container">
      <div className="user-list-panel">
        <div className="search-bar-container">
            <input 
                type="text"
                placeholder="Search users..."
                className="user-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="user-list-items">
            {filteredUsers.map((user) => (
              <UserList 
                key={user.id} 
                user={user} 
                active={activeUser && activeUser.id === user.id}
                onClick={() => setActiveUser(user)}
              />
            ))}
        </div>
      </div>
      <div className="chat-panel">
        <div className="chat-header">
          <span className="date-divider">{todayDate}</span>
        </div>
        <div className="messages-list">
          {messages.length > 0 ? messages.map((message) => (
            <Message key={message.id} message={message} onDelete={handleDeleteMessage} />
          )) : (
            <div className="no-messages-prompt">
                Start a conversation with {activeUser.name}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Inbox;