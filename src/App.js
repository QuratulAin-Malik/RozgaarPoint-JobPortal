import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
// --- NEW: Import the Auth Provider we created ---
import { AuthProvider } from './context/AuthContext'; 

// --- 1. Public Pages ---
import Welcome from './pages/Welcome';
import LoginEmployer from './pages/LoginEmployer';
import RegisterEmployer from './pages/RegisterEmployer';

// --- 2. Dashboard Components ---
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PostNewJob from './pages/Post New Job'; 
import JobManagement from './pages/Job Management'; 
import Billing from './pages/Billing';

// --- 3. ATS & ASSESSMENTS (Real Pages) ---
import ApplicationsATS from './pages/ApplicationsATS';
import Assessments from './pages/Assessments'; 
import ProfileSettings from './pages/ProfileSettings';

// --- 4. SECURITY (The New Guard) ---
import ProtectedRoute from './pages/ProtectedRoute'; 

// --- LAYOUT COMPONENT ---
const DashboardLayout = () => {
  return (
    <div style={styles.appContainer}>
      <Sidebar />
      <main style={styles.mainContent}>
        <Outlet /> 
      </main>
    </div>
  );
};

// --- CORE APP COMPONENT ---
function AppContent() {
  return (
    <Router>
      <Routes>
        
        {/* === PUBLIC ROUTES (Anyone can see these) === */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<LoginEmployer />} />
        <Route path="/register" element={<RegisterEmployer />} />

        {/* === PROTECTED DASHBOARD ROUTES === */}
        <Route 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        > 
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/post-new-job" element={<PostNewJob />} />
            <Route path="/edit-job/:id" element={<PostNewJob />} />
            <Route path="/job-management" element={<JobManagement />} />
            <Route path="/billing" element={<Billing />} />

            <Route path="/applications-ats" element={<ApplicationsATS />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            
        </Route>

      </Routes>
    </Router>
  );
}

// --- MAIN WRAPPER (This fulfills the AuthProvider requirement) ---
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
  },
  mainContent: {
    flexGrow: 1,
    marginLeft: '250px',
    width: 'calc(100% - 250px)',
    backgroundColor: '#F3F4F6'
  }
};

export default App;