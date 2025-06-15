import React, { useState, useEffect, useCallback } from 'react';
import { 
  db, 
  getDocs, 
  collection, 
  query, 
  where, 
  updateDoc, 
  doc,
  arrayUnion 
} from '../../firebase';

const SearchUser = ({ currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Wrap searchUsers in useCallback to memoize it
  const searchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff')
      );
      
      const querySnapshot = await getDocs(q);
      const users = [];
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.uid) {
          users.push({ id: doc.id, ...doc.data() });
        }
      });
      
      setResults(users);
    } catch (error) {
      console.error("Error searching users: ", error);
    }
    setLoading(false);
  }, [searchTerm, currentUser.uid]); // Add dependencies

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchUsers();
    } else {
      setResults([]);
    }
  }, [searchTerm, searchUsers]); // Add searchUsers to dependencies

  const sendFollowRequest = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        followRequests: arrayUnion(currentUser.uid)
      });
      alert('Follow request sent!');
    } catch (error) {
      console.error("Error sending follow request: ", error);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Search Users</h3>
      <input
        type="text"
        placeholder="Search by username..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-md"
      />
      
      {loading && <p className="mt-2">Searching...</p>}
      
      <div className="mt-4 space-y-2">
        {results.map(user => (
          <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center">
              <img 
                src={user.photoURL || 'https://via.placeholder.com/40'} 
                alt={user.displayName} 
                className="w-10 h-10 rounded-full mr-3" 
              />
              <span>{user.displayName}</span>
            </div>
            <button
              onClick={() => sendFollowRequest(user.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUser;