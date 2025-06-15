import React from 'react';

const ReactionPicker = ({ onSelect }) => {
  const reactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
  
  return (
    <div className="flex space-x-2 p-1 bg-white rounded-full shadow-md">
      {reactions.map((reaction) => (
        <button
          key={reaction}
          onClick={() => onSelect(reaction)}
          className="text-xl hover:scale-125 transition-transform duration-200 w-8 h-8 flex items-center justify-center"
        >
          {reaction}
        </button>
      ))}
    </div>
  );
};

export default ReactionPicker;