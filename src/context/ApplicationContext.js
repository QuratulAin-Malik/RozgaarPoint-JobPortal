import React, { createContext, useState } from 'react';

export const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([
    { 
      id: '101', 
      jobTitle: 'Demo: Heavy Driver', 
      company: 'Logistics Co.', 
      date: '2025-12-14', 
      status: 'Reviewed', 
      progress: 2 
    }
  ]);

  // 1. Add Application
  const addApplication = (job) => {
    const newApp = {
      id: Date.now().toString(),
      jobTitle: job.title,
      company: job.company || 'Unknown Company',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      progress: 1,
      // Store extra details so View Details works
      location: job.location,
      salary: job.salary,
      description: job.description
    };
    setApplications(prev => [newApp, ...prev]);
  };

  // 2. ✅ NEW: Delete Application
  const deleteApplication = (id) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  return (
    <ApplicationContext.Provider value={{ applications, addApplication, deleteApplication }}>
      {children}
    </ApplicationContext.Provider>
  );
};