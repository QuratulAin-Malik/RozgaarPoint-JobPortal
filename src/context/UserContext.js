import React, { createContext, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // ✅ Start with empty placeholders (No more "Ali Khan")
  const [user, setUser] = useState({
    name: 'Guest User',
    email: 'guest@example.com',
    phone: '',
    location: '',
    role: 'Job Seeker'
  });

  const updateUser = (newData) => {
    setUser((prev) => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};