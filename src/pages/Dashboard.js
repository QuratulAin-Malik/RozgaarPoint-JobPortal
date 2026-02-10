import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUpRight, CheckCircle, Eye, User, Briefcase, 
  AlertTriangle, X, MapPin, DollarSign, Clock, 
  Share2, Bookmark, Building2, Phone // <--- Added Phone Icon
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // --- STATE ---
  const [liveJobsCount, setLiveJobsCount] = useState(0);
  const [recentJobs, setRecentJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Employer');
  const [previewJob, setPreviewJob] = useState(null); 

  // --- FETCH DATA ---
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const userId = localStorage.getItem('userId');

    if (storedName) setUserName(storedName);

    const fetchData = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // HTTPS PORT 7149
        const response = await fetch(`https://localhost:7149/api/JobPosting/myjobs/${userId}`);
        if (response.ok) {
          const myJobs = await response.json();
          setLiveJobsCount(myJobs.length);
          setRecentJobs(myJobs.slice(0, 3)); 
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error connecting to API:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- HANDLERS ---
  const openPreview = (job) => setPreviewJob(job);
  const closePreview = () => setPreviewJob(null);

  // --- HELPER FOR TIME AGO ---
  const getTimeAgo = (dateString) => {
    const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return days === 0 ? "Just now" : `${days}d ago`;
  };

  return (
    <div style={styles.container}>
      {/* --- DASHBOARD HEADER --- */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.welcomeHeading}>Welcome, {userName}!</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Here is what's happening with your job posts.</p>
        </div>
        <div style={styles.profileIcon}>
            <User size={24} color="#64748b" />
        </div>
      </header>

      {/* --- STATS CARDS --- */}
      <div style={styles.statsContainer}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total Applications</h3>
          <div style={styles.cardContent}>
            <span style={styles.cardNumber}>0</span>
            <ArrowUpRight size={24} color="#3b82f6" style={{ marginLeft: 'auto' }} />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Live Jobs</h3>
          <div style={styles.cardContent}>
            <span style={styles.cardNumber}>
              {isLoading ? '...' : liveJobsCount}
            </span>
            <CheckCircle size={24} color="#22c55e" style={{ marginLeft: '10px' }} />
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Total Views</h3>
          <div style={styles.cardContent}>
            <span style={styles.cardNumber}>0</span>
            <Eye size={24} color="#64748b" style={{ marginLeft: '10px' }} />
          </div>
        </div>

        <a href="/post-new-job" style={{textDecoration: 'none'}}>
            <button style={styles.postJobButton}>
            Post a New Job
            </button>
        </a>
      </div>

      {/* --- RECENT ACTIVITY --- */}
      <div style={styles.activityContainer}>
        <h2 style={styles.activityHeading}>Recent Job Activity</h2>
        
        <div style={styles.activityList}>
          {recentJobs.length > 0 ? (
            recentJobs.map((job) => (
              <div style={styles.activityItem} key={job.id}>
                <div style={styles.activityLeft}>
                  <div style={{ ...styles.iconBox, backgroundColor: '#dbeafe', color: '#2563eb' }}>
                    <Briefcase size={18} />
                  </div>
                  <div style={{display:'flex', flexDirection:'column'}}>
                    <p style={styles.activityText}>
                        You posted: <strong>{job.jobTitle}</strong> 
                    </p>
                    <span style={styles.timeMsg}>
                         {new Date(job.datePosted).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <span style={styles.actionLink} onClick={() => openPreview(job)}>
                  View Preview
                </span>
              </div>
            ))
          ) : (
            <p style={{ padding: '10px', color: '#64748b' }}>No jobs posted yet.</p>
          )}
        </div>
      </div>

      {/* --- PROFESSIONAL PREVIEW MODAL CARD --- */}
      {previewJob && (
        <div style={modalStyles.overlay}>
          <div style={modalStyles.cardBody}>
            
            {/* 1. Clean Navigation Header */}
            <div style={modalStyles.navHeader}>
                <h3 style={modalStyles.navTitle}>Job Preview</h3>
                <div style={modalStyles.closeBtn} onClick={closePreview}>
                    <X size={24} color="#475569" />
                </div>
            </div>

            {/* 2. Scrollable Content Area */}
            <div style={modalStyles.scrollableContent}>
              
              {/* Vibrant Cover Banner */}
              <div style={modalStyles.banner}></div>

              <div style={modalStyles.contentPadding}>
                
                {/* Header Block with Overlapping Logo */}
                <div style={modalStyles.headerBlock}>
                   <div style={modalStyles.companyLogoLarge}>
                      {previewJob.organizationName?.charAt(0).toUpperCase() || <Building2 size={32}/>}
                   </div>
                   <h2 style={modalStyles.jobTitle}>{previewJob.jobTitle}</h2>
                   
                   {/* Metadata Row */}
                   <div style={modalStyles.metaRow}>
                      <span style={modalStyles.companyName}>{previewJob.organizationName}</span>
                      <span style={modalStyles.dotSeparator}>•</span>
                      <div style={modalStyles.metaItem}>
                        <MapPin size={14} style={{marginRight:'4px'}}/> {previewJob.location}
                      </div>
                      <span style={modalStyles.dotSeparator}>•</span>
                      <span style={modalStyles.postedText}>{getTimeAgo(previewJob.datePosted)}</span>
                   </div>

                    {/* Action Icons Row */}
                   <div style={modalStyles.actionIconsRow}>
                       <button style={modalStyles.iconButton}><Share2 size={20}/></button>
                       <button style={modalStyles.iconButton}><Bookmark size={20}/></button>
                   </div>
                </div>

                {/* Refined Quick Stats Grid */}
                <div style={modalStyles.statsGrid}>
                    <div style={modalStyles.statItem}>
                        <span style={modalStyles.statLabel}>Job Type</span>
                        <span style={modalStyles.statValue}>{previewJob.jobTiming}</span>
                    </div>
                    <div style={modalStyles.statItem}>
                        <span style={modalStyles.statLabel}>Experience</span>
                        <span style={modalStyles.statValue}>{previewJob.experienceLevel}</span>
                    </div>
                    <div style={modalStyles.statItem}>
                        <span style={modalStyles.statLabel}>Salary</span>
                        <span style={modalStyles.statValuePk}>{previewJob.salary?.toLocaleString()} PKR</span>
                    </div>
                </div>

                <div style={modalStyles.divider}></div>

                {/* Description Section */}
                <h3 style={modalStyles.sectionHeader}>About the job</h3>
                <p style={modalStyles.description}>
                  {previewJob.jobDescription || "No description provided for this job post."}
                </p>

                {/* Skills Section */}
                <h3 style={modalStyles.sectionHeader}>Skills & Requirements</h3>
                <div style={modalStyles.skillsContainer}>
                    {previewJob.skills ? (
                        previewJob.skills.split(',').map((skill, index) => (
                            <span key={index} style={modalStyles.skillChip}>
                                {skill.trim()}
                            </span>
                        ))
                    ) : (
                        <span style={{color:'#94a3b8', fontSize:'14px'}}>No specific skills listed.</span>
                    )}
                </div>

                {/* Padding for scrolling past the sticky button */}
                <div style={{height: '100px'}}></div>
              </div>
            </div>

            {/* 3. PROFESSIONAL STICKY BOTTOM ACTION BAR */}
            <div style={modalStyles.stickyBottomBar}>
                
                {/* A. CALL BUTTON (Conditional) */}
                {previewJob.contactPhone && (
                  <a 
                    href={`tel:${previewJob.contactPhone}`} 
                    style={modalStyles.callButton}
                  >
                    <Phone size={20} /> Call
                  </a>
                )}

                {/* B. APPLY BUTTON (Always Visible) */}
                <button style={modalStyles.applyButton}>
                    Apply Now
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

// --- DASHBOARD STYLES (Standard Layout) ---
const styles = {
  container: { padding: '30px 40px', background: '#f0f9ff', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' },
  welcomeHeading: { fontSize: '26px', fontWeight: '700', color: '#0f172a', margin: 0 },
  profileIcon: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff', border: '1px solid #e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  statsContainer: { display: 'flex', gap: '25px', marginBottom: '35px', alignItems: 'center', flexWrap: 'wrap' },
  card: { backgroundColor: '#fff', padding: '20px 25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)', flex: 1, minWidth: '200px' },
  cardTitle: { fontSize: '14px', fontWeight: '500', color: '#64748b', margin: '0 0 10px 0' },
  cardContent: { display: 'flex', alignItems: 'center' },
  cardNumber: { fontSize: '30px', fontWeight: '700', color: '#0f172a' },
  postJobButton: { backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', whiteSpace: 'nowrap', height: 'fit-content' },
  activityContainer: { backgroundColor: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' },
  activityHeading: { fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 25px 0' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  activityItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' },
  activityLeft: { display: 'flex', alignItems: 'center' },
  iconBox: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' },
  activityText: { margin: 0, fontSize: '15px', color: '#334155', fontWeight: '500' },
  timeMsg: { color: '#94a3b8', fontWeight: '400', marginLeft: '0px', fontSize: '13px', display: 'block', marginTop: '4px' },
  actionLink: { fontSize: '14px', fontWeight: '600', color: '#3b82f6', cursor: 'pointer', textDecoration: 'none' }
};

// --- PROFESSIONAL PREVIEW CARD STYLES ---
const modalStyles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Deep professional dim
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000, backdropFilter: 'blur(8px)',
    padding: '20px'
  },
  cardBody: {
    width: '100%', maxWidth: '550px',
    height: '90vh', maxHeight: '800px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', position: 'relative'
  },
  navHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '16px 24px', backgroundColor: '#fff',
      borderBottom: '1px solid #f1f5f9', zIndex: 2
  },
  navTitle: { fontSize: '16px', fontWeight: '700', color: '#334155', margin: 0 },
  closeBtn: { cursor: 'pointer', padding: '8px', borderRadius: '50%', backgroundColor: '#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center' },
  
  scrollableContent: {
    flex: 1, overflowY: 'auto', backgroundColor: '#fff',
    position: 'relative', scrollbarWidth: 'thin'
  },
  banner: {
      height: '140px',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      width: '100%'
  },
  contentPadding: {
      padding: '0 28px',
      marginTop: '-50px' // Deeper overlap
  },
  headerBlock: { marginBottom: '30px', position: 'relative' },
  companyLogoLarge: {
      width: '88px', height: '88px', borderRadius: '18px',
      backgroundColor: '#fff', color: '#2563eb',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontSize: '36px', fontWeight: 'bold',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      marginBottom: '18px', border: '4px solid #fff'
  },
  jobTitle: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', lineHeight: '1.1', letterSpacing: '-0.5px' },
  metaRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', color: '#64748b', fontSize: '15px' },
  companyName: { fontWeight: '600', color: '#1e293b' },
  metaItem: { display: 'flex', alignItems: 'center' },
  postedText: { color: '#16a34a', fontWeight: '600', fontSize: '14px' },
  dotSeparator: { color: '#cbd5e1', fontSize: '14px' },
  
  actionIconsRow: { display: 'flex', gap: '12px', marginTop: '20px' },
  iconButton: { padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#475569', cursor: 'pointer', display:'flex' },

  statsGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '30px'
  },
  statItem: {
      backgroundColor: '#f8fafc', borderRadius: '14px', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '6px',
      border: '1px solid #f1f5f9'
  },
  statLabel: { fontSize: '13px', fontWeight: '500', color: '#64748b' },
  statValue: { fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  statValuePk: { fontSize: '15px', fontWeight: '700', color: '#2563eb' },

  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '0 0 30px 0' },
  sectionHeader: { fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' },
  description: { fontSize: '16px', color: '#334155', lineHeight: '1.7', marginBottom: '35px', whiteSpace: 'pre-line' },

  skillsContainer: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  skillChip: {
      backgroundColor: '#eff6ff', color: '#1d4ed8',
      padding: '10px 16px', borderRadius: '24px',
      fontSize: '14px', fontWeight: '600',
      border: '1px solid #dbeafe'
  },

  stickyBottomBar: {
      position: 'absolute', bottom: 0, left: 0, right: 0,
      backgroundColor: '#fff',
      padding: '20px 28px',
      borderTop: '1px solid #f1f5f9',
      boxShadow: '0 -10px 20px -5px rgba(0, 0, 0, 0.05)',
      display: 'flex', gap: '12px', justifyContent: 'center', zIndex: 10
  },
  // Style for the "Call" button
  callButton: {
      flex: 1, // Takes 50% width
      backgroundColor: '#fff', 
      color: '#2563eb',
      border: '2px solid #2563eb',
      padding: '16px', borderRadius: '16px',
      fontSize: '16px', fontWeight: '700',
      textDecoration: 'none', display: 'flex', 
      justifyContent: 'center', alignItems: 'center',
      gap: '8px', cursor: 'pointer',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)'
  },
  // Style for the "Apply" button
  applyButton: {
      flex: 1, // Takes 50% width (or 100% if alone)
      backgroundColor: '#2563eb', color: 'white',
      padding: '18px', borderRadius: '16px',
      fontSize: '18px', fontWeight: '700', border: 'none',
      cursor: 'not-allowed', opacity: 0.9,
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
      transition: 'transform 0.1s'
  }
};

export default Dashboard;