// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { db, doc, getDoc, updateDoc } from '../firebase';

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile(data);
        setDisplayName(data.displayName);
        setBio(data.bio || '');
      }
    };
    
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bio
      });
      setProfile({ ...profile, displayName, bio });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile: ", error);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-6">
        <img 
          src={user.photoURL || 'https://via.placeholder.com/100'} 
          alt={profile.displayName} 
          className="w-24 h-24 rounded-full mr-6" 
        />
        <div>
          {editing ? (
            <>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-2xl font-bold mb-2 w-full p-2 border rounded"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell something about yourself..."
                className="w-full p-2 border rounded"
                rows="3"
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              <p className="text-gray-600">{profile.bio || 'No bio yet'}</p>
            </>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg flex-1">
          <div className="text-xl font-bold">{profile.followers?.length || 0}</div>
          <div className="text-gray-600">Followers</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg flex-1">
          <div className="text-xl font-bold">{profile.following?.length || 0}</div>
          <div className="text-gray-600">Following</div>
        </div>
      </div>
      
      <div className="flex justify-end">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              className="mr-2 px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Save Changes
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;