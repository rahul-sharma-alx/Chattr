import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, signOut } from '../../firebase';

const Navbar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">Chattr</Link>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <Link to="/profile" className="hover:text-blue-600">Profile</Link>
              
              <div className="flex items-center">
                <img 
                  src={user.photoURL || 'https://via.placeholder.com/40'} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-full mr-2" 
                />
                <button 
                  onClick={handleLogout}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">Login</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;