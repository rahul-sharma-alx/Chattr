// src/components/Chat/Message.js
import React, { useState } from 'react';
import MediaRenderer from './MediaRenderer';
import ReactionPicker from './ReactionPicker';
import { format } from 'date-fns';

const Message = ({ message, currentUser, onReaction, onReply }) => {
  const isCurrentUser = message.senderId === currentUser.uid;
  const [showReactions, setShowReactions] = useState(false);
  
  const handleReactionSelect = (emoji) => {
    onReaction(message.id, emoji);
    setShowReactions(false);
  };

  return (
    <div className={`mb-4 ${isCurrentUser ? 'text-right' : ''}`}>
      <div 
        className={`inline-block p-3 rounded-lg max-w-xs md:max-w-md ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {!isCurrentUser && (
          <div className="font-semibold text-sm mb-1">
            {message.senderName}
          </div>
        )}
        
        {message.replyTo && (
          <div className={`mb-1 p-2 text-xs rounded ${
            isCurrentUser ? 'bg-blue-400' : 'bg-gray-300'
          }`}>
            <div className="font-semibold">
              {message.replyTo.senderId === currentUser.uid ? 'You' : message.replyTo.senderName}
            </div>
            <div className="truncate">
              {message.replyTo.text || (message.replyTo.mediaUrl ? 'Media' : '')}
            </div>
          </div>
        )}
        
        {message.mediaUrl && (
          <div className="mb-2">
            <MediaRenderer 
              mediaUrl={message.mediaUrl} 
              mediaType={message.mediaType} 
            />
          </div>
        )}
        
        {message.text && <div>{message.text}</div>}
        
        <div className="text-xs mt-1 opacity-75">
          {format(message.timestamp?.toDate(), 'HH:mm')}
        </div>
      </div>
      
      <div className={`flex mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <button 
          className="text-gray-500 hover:text-gray-700 mx-1"
          onClick={() => onReply(message)}
        >
          Reply
        </button>
        
        <div className="relative">
          <button 
            className="text-gray-500 hover:text-gray-700 mx-1"
            onClick={() => setShowReactions(!showReactions)}
          >
            React
          </button>
          
          {showReactions && (
            <div className="absolute bottom-full left-0 bg-white p-2 rounded-lg shadow-lg z-10">
              <ReactionPicker onSelect={handleReactionSelect} />
            </div>
          )}
        </div>
      </div>
      
      {Object.keys(message.reactions || {}).length > 0 && (
        <div className={`flex mt-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {Object.entries(message.reactions).map(([userId, emoji]) => (
            <span key={userId} className="mx-1">
              {emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;