import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Edit, Trash2, PauseCircle, PlayCircle, Plus } from 'lucide-react';

const JobManagement = () => {
  const navigate = useNavigate();

  // State for data and UI
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // 1. FETCH JOBS FROM API (UPDATED FOR SECURITY)
  const fetchJobs = async () => {
    try {
      // --- STEP A: Get the logged-in User's ID from Local Storage ---
      // NOTE: Ensure 'userId' matches exactly what you set in LoginEmployer.js
      const userId = localStorage.getItem('userId'); 

      if (!userId) {
        alert("Session expired. Please log in again.");
        navigate('/login-employer'); // Redirect if no user found
        return;
      }

      // --- STEP B: Call the NEW 'myjobs' Endpoint ---
      const response = await fetch(`https://localhost:7149/api/JobPosting/myjobs/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        console.error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 2. HANDLE DELETE ACTION
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        const response = await fetch(`https://localhost:7149/api/JobPosting/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove from UI immediately
          setJobs(jobs.filter(job => job.id !== id));
        } else {
          alert("Failed to delete job.");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
      }
    }
  };

  // 3. HANDLE PAUSE/RESUME ACTION (Update Status)
  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'Active' ? 'Paused' : 'Active';
    const updatedJob = { ...job, status: newStatus };

    try {
      const response = await fetch(`https://localhost:7149/api/JobPosting/${job.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedJob)
      });

      if (response.ok) {
        // Update UI locally to reflect change
        setJobs(jobs.map(j => (j.id === job.id ? { ...j, status: newStatus } : j)));
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // 4. FILTERING LOGIC (Search + Status Dropdown)
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      {/* Page Header */}
      <h1 style={styles.header}>Job Management</h1>

      {/* Controls Bar (Search, Filter, Button) */}
      <div style={styles.controlsBar}>
        <div style={styles.searchWrapper}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.rightControls}>
          <div style={styles.filterWrapper}>
            <span style={{marginRight: '8px', color: '#6b7280', fontSize: '14px'}}>Status:</span>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectInput}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Paused">Paused</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <Link to="/post-new-job" style={{ textDecoration: 'none' }}>
            <button style={styles.postBtn}>
              <Plus size={18} /> Post a New Job
            </button>
          </Link>
        </div>
      </div>

      {/* Jobs Table */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Job Title</th>
              <th style={styles.th}>Date Posted</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Applicants</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center'}}>Loading...</td></tr>
            ) : filteredJobs.length === 0 ? (
              <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center'}}>No jobs found.</td></tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} style={styles.tableRow}>
                  {/* Job Title */}
                  <td style={styles.td}>
                    <div style={{fontWeight: '600', color: '#111827'}}>{job.jobTitle}</div>
                    <div style={{fontSize: '12px', color: '#6b7280'}}>{job.location}</div>
                  </td>

                  {/* Date Posted */}
                  <td style={styles.td}>{new Date(job.datePosted).toLocaleDateString()}</td>

                  {/* Status Badge */}
                  <td style={styles.td}>
                    <span style={getStatusStyle(job.status)}>
                      {job.status}
                    </span>
                  </td>

                  {/* Applicants */}
                  <td style={styles.td}>
                    {job.applicantCount || 0} Candidates
                  </td>

                  {/* Action Buttons */}
                  <td style={styles.td}>
                    <div style={styles.actionContainer}>
                      
                      {/* --- EDIT BUTTON --- */}
                      <button 
                        style={styles.actionBtn} 
                        title="Edit Job"
                        onClick={() => navigate(`/edit-job/${job.id}`)} 
                      >
                        <Edit size={16} color="#4b5563" /> Edit
                      </button>

                      {/* Pause/Resume Button */}
                      <button 
                        style={styles.actionBtn} 
                        onClick={() => handleToggleStatus(job)}
                        title={job.status === 'Active' ? 'Pause Job' : 'Resume Job'}
                      >
                        {job.status === 'Active' ? (
                          <> <PauseCircle size={16} color="#d97706" /> Pause </>
                        ) : (
                          <> <PlayCircle size={16} color="#16a34a" /> Resume </>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button 
                        style={{...styles.actionBtn, color: '#dc2626'}} 
                        onClick={() => handleDelete(job.id)}
                        title="Delete Job"
                      >
                        <Trash2 size={16} color="#dc2626" /> Close
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper function for Status Colors
const getStatusStyle = (status) => {
  const baseStyle = {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
  };

  if (status === 'Active') {
    return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' }; 
  } else if (status === 'Paused') {
    return { ...baseStyle, backgroundColor: '#fef9c3', color: '#854d0e' }; 
  } else {
    return { ...baseStyle, backgroundColor: '#f3f4f6', color: '#374151' }; 
  }
};

// Inline CSS
const styles = {
  container: { padding: '30px 40px', backgroundColor: '#f4f6f8', minHeight: '100vh' },
  header: { fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '25px' },
  controlsBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '20px' },
  searchWrapper: { position: 'relative', flex: 1, maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' },
  searchInput: { width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' },
  rightControls: { display: 'flex', gap: '15px', alignItems: 'center' },
  filterWrapper: { display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '5px 15px', borderRadius: '8px', border: '1px solid #d1d5db' },
  selectInput: { border: 'none', outline: 'none', fontSize: '14px', color: '#374151', cursor: 'pointer', backgroundColor: 'transparent' },
  postBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  tableCard: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeader: { backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '15px 20px', fontSize: '13px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' },
  td: { padding: '15px 20px', fontSize: '14px', color: '#374151', verticalAlign: 'middle' },
  actionContainer: { display: 'flex', gap: '10px' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#374151', transition: '0.2s' }
};

export default JobManagement;