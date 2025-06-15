// src/pages/Home.js
// import FollowRequest from '../components/Follow/FollowRequest';
import { addDoc } from '../firebase';

import React, { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  query, 
  where, 
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from '../firebase';
import SearchUser from '../components/Follow/SearchUser';
import ChatRoom from '../components/Chat/ChatRoom';
import Suggestions from '../components/UI/Suggestions';

const Home = ({ user }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [followRequests, setFollowRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch user's chats
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.uid));
    
    const unsubscribeChats = onSnapshot(q, async (snapshot) => {
      const chatsData = [];
      
      for (const docRef of snapshot.docs) {
        const chat = { id: docRef.id, ...docRef.data() };
        const otherUserId = chat.participants.find(id => id !== user.uid);
        
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          chat.recipient = { id: otherUserId, ...userDoc.data() };
        }
        
        chatsData.push(chat);
      }
      
      setChats(chatsData);
      setLoading(false);
    });

    // Fetch follow requests
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
       if (doc.exists()) {
        const userData = doc.data();
        setFollowRequests(userData.followRequests || []);
      }else{
        setDoc(userRef, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          followers: [],
          following: [],
          followRequests: []
        }).then(() => {
          setFollowRequests([]);
        });
      }
    });

    return () => {
      unsubscribeChats();
      unsubscribeUser();
    };
  }, [user]);

  const handleAcceptRequest = async (requesterId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const requesterRef = doc(db, 'users', requesterId);
      
      // Update both users
      await updateDoc(userRef, {
        followers: arrayUnion(requesterId),
        followRequests: arrayRemove(requesterId)
      });
      
      await updateDoc(requesterRef, {
        following: arrayUnion(user.uid)
      });
      
      // Create a chat if mutual follow exists
      const requesterDoc = await getDoc(requesterRef);
      const requesterData = requesterDoc.data();
      
      if (requesterData.followers?.includes(user.uid)) {
        await createChat(user.uid, requesterId);
      }
    } catch (error) {
      console.error("Error accepting follow request: ", error);
    }
  };

  const createChat = async (user1Id, user2Id) => {
    try {
      const chatsRef = collection(db, 'chats');
      await addDoc(chatsRef, {
        participants: [user1Id, user2Id],
        createdAt: new Date()
      });
    } catch (error) {
      console.error("Error creating chat: ", error);
    }
  };

  if (loading) {
    return <div>Loading chats...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-6rem)]">
      <div className="md:w-1/3 flex flex-col">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-4">Follow Requests</h2>
          {followRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {followRequests.map(userId => (
                <FollowRequestItem 
                  key={userId} 
                  userId={userId} 
                  onAccept={() => handleAcceptRequest(userId)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 mt-4 flex-grow">
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          <div className="space-y-2">
            {chats.map(chat => (
              <div 
                key={chat.id}
                className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                  activeChat?.id === chat.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setActiveChat(chat)}
              >
                <div className="font-semibold">{chat.recipient?.displayName}</div>
                <div className="text-sm text-gray-500 truncate">
                  {chat.lastMessage?.text || 'Start a conversation...'}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <SearchUser currentUser={user} />
        <Suggestions currentUser={user} />
      </div>
      
      <div className="md:w-2/3 bg-white rounded-lg shadow flex-grow">
        {activeChat ? (
          <ChatRoom 
            chatId={activeChat.id} 
            currentUser={user} 
            recipient={activeChat.recipient} 
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FollowRequestItem = ({ userId, onAccept }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      }
    };
    
    fetchUser();
  }, [userId]);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
      <div className="flex items-center">
        <img 
          src={user.photoURL || 'https://via.placeholder.com/40'} 
          alt={user.displayName} 
          className="w-10 h-10 rounded-full mr-3" 
        />
        <span>{user.displayName}</span>
      </div>
      <button
        onClick={onAccept}
        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
      >
        Accept
      </button>
    </div>
  );
};

export default Home;