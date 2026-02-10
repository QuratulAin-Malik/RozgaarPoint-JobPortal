import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, ClipboardCheck, PlusCircle, User, CreditCard } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Job Management', path: '/job-management', icon: <Briefcase size={20} /> },
    { name: 'Applications (ATS)', path: '/applications-ats', icon: <FileText size={20} /> },
    { name: 'Assessments', path: '/assessments', icon: <ClipboardCheck size={20} /> },
    { name: 'Post New Job', path: '/post-new-job', icon: <PlusCircle size={20} /> },
    { name: 'Profile & Settings', path: '/profile-settings', icon: <User size={20} /> },
    { name: 'Billing', path: '/billing', icon: <CreditCard size={20} /> },
  ];

  return (
    <div style={styles.sidebar}>
      {/* Logo Section */}
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>R</div>
        <span style={styles.logoText}>Rozgar Point</span>
      </div>

      {/* Navigation Menu */}
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={isActive ? { ...styles.link, ...styles.activeLink } : styles.link}
              // Hover effect logic
              onMouseEnter={(e) => {
                if(!isActive) e.currentTarget.style.backgroundColor = '#2d3a4f';
                if(!isActive) e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                if(!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                if(!isActive) e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <span style={{ ...styles.icon, color: isActive ? '#fff' : 'inherit' }}>
                {item.icon}
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    // UPDATED: Deep Professional Blue (Indigo-Navy)
    backgroundColor: '#1e293b', 
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    borderRight: '1px solid #334155',
    boxShadow: '4px 0 10px rgba(0,0,0,0.05)',
  },
  logoContainer: {
    padding: '30px 25px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
  },
  logoIcon: {
    backgroundColor: '#3b82f6', // Brand Blue
    width: '35px',
    height: '35px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '800',
    fontSize: '20px',
  },
  logoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: '20px',
    letterSpacing: '0.5px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0 15px',
    gap: '4px',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#94a3b8',
    padding: '12px 16px',
    borderRadius: '10px',
    transition: 'all 0.3s ease',
    fontWeight: '500',
    fontSize: '15px',
  },
  activeLink: {
    // UPDATED: Solid Brand Blue with a subtle glow for the active item
    backgroundColor: '#3b82f6', 
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
  },
  icon: {
    marginRight: '14px',
    display: 'flex',
  }
};

export default Sidebar;