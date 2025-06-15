// src/components/Chat/ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  db, 
  collection, 
  addDoc, 
  query,
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
} from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Message from './Message';
import MediaRenderer from './MediaRenderer';

const ChatRoom = ({ chatId, currentUser, recipient }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [media, setMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = [];
        snapshot.forEach(doc => {
          msgs.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !media) return;
    
    let mediaUrl = '';
    let mediaType = '';
    
    if (media) {
      setIsUploading(true);
      try {
        const storage = getStorage();
        const storageRef = ref(storage, `chats/${chatId}/${media.name}`);
        await uploadBytes(storageRef, media);
        mediaUrl = await getDownloadURL(storageRef);
        mediaType = media.type.split('/')[0]; // 'image', 'video', 'audio'
      } catch (error) {
        console.error("Error uploading file: ", error);
        setIsUploading(false);
        return;
      }
    }
    
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: currentUser.uid,
        timestamp: new Date(),
        mediaUrl,
        mediaType,
        reactions: {}
      });
      
      setNewMessage('');
      setMedia(null);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
    
    setIsUploading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    
    await updateDoc(messageRef, {
      [`reactions.${currentUser.uid}`]: emoji
    });
  };

  const handleReply = (message) => {
    setNewMessage(`@${message.senderName} `);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 p-4 border-b">
        <h3 className="text-lg font-semibold">{recipient.displayName}</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        {messages.map((msg) => (
          <Message 
            key={msg.id}
            message={msg}
            currentUser={currentUser}
            onReaction={handleReaction}
            onReply={handleReply}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        {media && (
          <div className="mb-2">
            <MediaRenderer 
              mediaUrl={URL.createObjectURL(media)} 
              mediaType={media.type.split('/')[0]} 
              preview 
            />
            <button 
              type="button" 
              onClick={() => setMedia(null)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        )}
        
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-l-md"
          />
          
          <label className="bg-gray-200 p-2 cursor-pointer">
            <input 
              type="file" 
              accept="image/*,video/*,audio/*" 
              onChange={handleFileChange}
              className="hidden"
            />
            📎
          </label>
          
          <button 
            type="submit" 
            disabled={isUploading}
            className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
          >
            {isUploading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;