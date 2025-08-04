// FILE: src/Inbox/Message.jsx

import React, { useState, useRef, useEffect } from 'react';
import './Message.css';

const MessageAvatar = ({ name }) => (
  <div className="message-avatar">
    <img src={`https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=EBF4FF&color=3B82F6&size=128`} alt={`${name}'s avatar`} />
  </div>
);

const Message = ({ message, onDelete }) => {
  const { id, text, time, isSentByMe, sender } = message;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);


  const handleReply = () => {
    console.log("Replying to message:", id);
    setShowMenu(false);
  };

  const handleForward = () => {
    console.log("Forwarding message:", id);
    setShowMenu(false);
  };

  return (
    <div className={`message-container ${isSentByMe ? 'sent-by-me' : 'received'}`}>
      {!isSentByMe && <MessageAvatar name={sender.name} />}
      
      <div className="message-bubble">
        <div className="message-content">
          <div className="message-text">{text}</div>
          <div className="message-time">{time}</div>
        </div>

        <div className="message-actions-trigger" onClick={() => setShowMenu(!showMenu)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </div>

        {showMenu && (
          <div className="message-actions-menu" ref={menuRef}>
            <button onClick={handleReply}>Reply</button>
            <button onClick={handleForward}>Forward</button>
            <button onClick={() => onDelete(id)} className="delete">Delete</button>
          </div>
        )}
      </div>

      {isSentByMe && <MessageAvatar name="Chandra Sekhar" />}
    </div>
  );
};

export default Message;
