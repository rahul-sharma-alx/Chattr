// src/components/Chat/MediaRenderer.js
import React from 'react';

const MediaRenderer = ({ mediaUrl, mediaType, preview }) => {
  if (!mediaUrl) return null;

  const renderContent = () => {
    switch (mediaType) {
      case 'image':
        return (
          <img 
            src={mediaUrl} 
            alt="Media" 
            className={`${preview ? 'max-h-20' : 'max-h-64'} rounded-md`}
          />
        );
      case 'video':
        return preview ? (
          <video 
            src={mediaUrl} 
            className="max-h-20 rounded-md"
            controls={false}
          />
        ) : (
          <video 
            src={mediaUrl} 
            className="max-h-64 rounded-md"
            controls
          />
        );
      case 'audio':
        return <audio src={mediaUrl} controls className="w-full" />;
      default:
        return (
          <a 
            href={mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View File
          </a>
        );
    }
  };

  return (
    <div className="bg-gray-100 p-2 rounded-md">
      {renderContent()}
    </div>
  );
};

export default MediaRenderer;