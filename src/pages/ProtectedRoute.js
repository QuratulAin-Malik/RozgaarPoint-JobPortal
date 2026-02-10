import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // 1. Check if the user is logged in
  // We check for 'userId' because you save it during login
  const userId = localStorage.getItem('userId');

  // 2. If NO userId is found, kick them out!
  if (!userId) {
    // "replace" removes the history so they can't click Back to return
    return <Navigate to="/" replace />;
  }

  // 3. If they have an ID, let them see the page
  return children;
};

export default ProtectedRoute;