import React, { useEffect, useState } from 'react';
import { db, doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc } from '../../firebase';

const FollowRequest = ({ currentUser }) => {
  const [followRequests, setFollowRequests] = useState([]);
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchRequests = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setFollowRequests(userDoc.data().followRequests || []);
      }
    };
    
    fetchRequests();
  }, [currentUser]);

  const handleAccept = async (requesterId) => {
    try {
      // Update current user's followers
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        followers: arrayUnion(requesterId),
        followRequests: arrayRemove(requesterId)
      });
      
      // Update requester's following
      const requesterRef = doc(db, 'users', requesterId);
      await updateDoc(requesterRef, {
        following: arrayUnion(currentUser.uid)
      });
      
      // Create chat if mutual follow exists
      const requesterDoc = await getDoc(requesterRef);
      const requesterData = requesterDoc.data();
      
      if (requesterData.followers?.includes(currentUser.uid)) {
        await createChat(currentUser.uid, requesterId);
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

  if (followRequests.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Follow Requests</h3>
      <div className="space-y-3">
        {followRequests.map(userId => (
          <FollowRequestItem 
            key={userId} 
            userId={userId} 
            onAccept={() => handleAccept(userId)}
          />
        ))}
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
  
  if (!user) return <div className="p-2 bg-gray-50 rounded-md">Loading...</div>;
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      <div className="flex items-center">
        <img 
          src={user.photoURL || 'https://via.placeholder.com/40'} 
          alt={user.displayName} 
          className="w-10 h-10 rounded-full mr-3" 
        />
        <span className="font-medium">{user.displayName}</span>
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

export default FollowRequest;