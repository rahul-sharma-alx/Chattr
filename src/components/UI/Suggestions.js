// src/components/UI/Suggestions.js
import React, { useEffect, useState } from 'react';
import { db, doc, getDoc, updateDoc, arrayUnion } from '../../firebase';

const Suggestions = ({ currentUser }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        
        // Simple algorithm: suggest users who are followed by people you follow
        const following = userData.following || [];
        let suggestedUsers = new Set();
        
        for (const userId of following) {
          const followedUserDoc = await getDoc(doc(db, 'users', userId));
          const followedUserData = followedUserDoc.data();
          
          (followedUserData.following || []).forEach(id => {
            if (
              id !== currentUser.uid && 
              !following.includes(id) && 
              !(userData.followRequests || []).includes(id)
            ) {
              suggestedUsers.add(id);
            }
          });
        }
        
        // Convert Set to array and fetch user details
        const usersToFetch = Array.from(suggestedUsers).slice(0, 5);
        const userDetails = await Promise.all(
          usersToFetch.map(async (id) => {
            const userDoc = await getDoc(doc(db, 'users', id));
            return { id, ...userDoc.data() };
          })
        );
        
        setSuggestions(userDetails);
      } catch (error) {
        console.error("Error fetching suggestions: ", error);
      }
    };
    
    fetchSuggestions();
  }, [currentUser]);

  const sendFollowRequest = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        followRequests: arrayUnion(currentUser.uid)
      });
      setSuggestions(suggestions.filter(user => user.id !== userId));
      alert('Follow request sent!');
    } catch (error) {
      console.error("Error sending follow request: ", error);
    }
  };

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-semibold mb-3">Suggestions For You</h3>
      <div className="space-y-3">
        {suggestions.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={user.photoURL || 'https://via.placeholder.com/40'} 
                alt={user.displayName} 
                className="w-10 h-10 rounded-full mr-3" 
              />
              <div>
                <div className="font-medium">{user.displayName}</div>
              </div>
            </div>
            <button
              onClick={() => sendFollowRequest(user.id)}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;