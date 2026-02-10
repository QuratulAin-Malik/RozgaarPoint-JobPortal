import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, X, Phone, Mail, Briefcase, User, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

const ApplicationsATS = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal & Zoom State
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); 
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch('https://localhost:7149/api/JobApplication/employer-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError("Could not load applications. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (appId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7149/api/JobApplication/application-details/${appId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedApp(data);
        setShowModal(true);
      } else {
        alert("Error loading details");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- FUNCTION TO HANDLE ACCEPT / REJECT ---
  const handleStatusUpdate = async (newStatus) => {
    if (!selectedApp) return;

    const confirmMessage = newStatus === 'Accepted' 
      ? "Are you sure you want to Shortlist this candidate?" 
      : "Are you sure you want to Reject this application?";

    if (!window.confirm(confirmMessage)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7149/api/JobApplication/update-status/${selectedApp.applicationId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStatus) // Sending string directly
      });

      if (response.ok) {
        // Update local state immediately so UI reflects change without closing modal
        setSelectedApp(prev => ({ ...prev, status: newStatus }));
        
        alert(`Success! Candidate has been ${newStatus}.`);
        
        // Refresh List to show new status color in the background table
        fetchApplications(); 
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Something went wrong.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
  };

  // Zoom Handlers
  const openZoom = (imageUrl) => {
    if (!imageUrl) return;
    setPreviewImage(imageUrl);
    setIsZoomed(false);
  };
  const closeZoom = () => {
    setPreviewImage(null);
    setIsZoomed(false);
  };
  const toggleZoomLevel = (e) => {
    e.stopPropagation(); 
    setIsZoomed(!isZoomed);
  };

  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'accepted': return styles.badgeAccepted;
      case 'rejected': return styles.badgeRejected;
      default: return styles.badgePending;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h1 style={styles.pageTitle}>Applications (ATS)</h1>
      </div>

      {/* Stats - Dynamic based on Status */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Total Applications</p>
          <h3 style={styles.cardNumber}>{applications.length}</h3>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Pending Review</p>
          <h3 style={{...styles.cardNumber, color: '#ca8a04'}}>
            {applications.filter(a => a.status === 'Pending').length}
          </h3>
        </div>
        <div style={styles.card}>
          <p style={styles.cardLabel}>Shortlisted</p>
          <h3 style={{...styles.cardNumber, color: '#16a34a'}}>
            {applications.filter(a => a.status === 'Accepted').length}
          </h3>
        </div>
      </div>

      {/* Main Table */}
      <div style={styles.tableContainer}>
        {loading ? <div style={styles.centerMessage}>Loading...</div> : 
         error ? <div style={{...styles.centerMessage, color: 'red'}}>{error}</div> : (
          <table style={styles.table}>
            <thead style={styles.tableHead}>
              <tr>
                <th style={styles.th}>Candidate Name</th>
                <th style={styles.th}>Applied For</th>
                <th style={styles.th}>Status</th>
                <th style={{...styles.th, textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.applicationId} style={styles.tr}>
                  <td style={styles.td}>
                    <p style={styles.applicantName}>{app.applicantName}</p>
                    <p style={styles.applicantEmail}>{app.applicantEmail}</p>
                  </td>
                  <td style={styles.td}>{app.jobTitle}</td>
                  <td style={styles.td}>
                    <span style={{...styles.badge, ...getStatusStyle(app.status)}}>{app.status}</span>
                  </td>
                  <td style={{...styles.td, textAlign: 'right'}}>
                    <button 
                      style={styles.actionButton}
                      onClick={() => handleViewDetails(app.applicationId)}
                    >
                      <Eye size={16} style={{marginRight: '5px'}} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && selectedApp && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Candidate Profile</h2>
                <p style={styles.modalSubtitle}>Application ID: #{selectedApp.applicationId}</p>
              </div>
              <button onClick={closeModal} style={styles.closeButton}>
                <X size={24}/>
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoSection}>
                <h3 style={styles.sectionTitle}>
                  <User size={16} style={{marginRight:'8px'}}/> Personal Information
                </h3>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <p style={styles.label}>Full Name</p>
                    <p style={styles.value}>{selectedApp.applicantName}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <p style={styles.label}><Briefcase size={12} style={{marginRight:4}}/> Job Applied For</p>
                    <p style={styles.value}>{selectedApp.jobTitle}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <p style={styles.label}><Mail size={12} style={{marginRight:4}}/> Email Address</p>
                    <p style={styles.value}>{selectedApp.applicantEmail}</p>
                  </div>
                  <div style={styles.infoItem}>
                    <p style={styles.label}><Phone size={12} style={{marginRight:4}}/> Primary Phone</p>
                    <p style={styles.value}>
                      {selectedApp.applicantPhone 
                        ? `+92 ${selectedApp.applicantPhone.replace(/^0+/, '')}` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.docsSection}>
                <h3 style={styles.sectionTitle}>Submitted Documents</h3>
                <p style={{fontSize:'12px', color:'#64748b', marginBottom:'16px'}}>Click on any image to zoom in.</p>
                <div style={styles.imageGrid}>
                  
                  <div style={styles.imageCard} onClick={() => openZoom(selectedApp.selfieUrl ? `http://localhost:5067/${selectedApp.selfieUrl}` : null)}>
                    <div style={styles.imageHeader}>Selfie / Profile</div>
                    <div style={styles.imageWrapper}>
                      {selectedApp.selfieUrl ? (
                        <img src={`http://localhost:5067/${selectedApp.selfieUrl}`} alt="Selfie" style={styles.docImage}/>
                      ) : <div style={styles.noImage}>No Image</div>}
                    </div>
                  </div>

                  <div style={styles.imageCard} onClick={() => openZoom(selectedApp.cnicFrontUrl ? `http://localhost:5067/${selectedApp.cnicFrontUrl}` : null)}>
                    <div style={styles.imageHeader}>CNIC Front</div>
                    <div style={styles.imageWrapper}>
                      {selectedApp.cnicFrontUrl ? (
                        <img src={`https://localhost:7149/${selectedApp.cnicFrontUrl}`} alt="Front" style={styles.docImage}/>
                      ) : <div style={styles.noImage}>No Image</div>}
                    </div>
                  </div>

                  <div style={styles.imageCard} onClick={() => openZoom(selectedApp.cnicBackUrl ? `http://localhost:5067/${selectedApp.cnicBackUrl}` : null)}>
                    <div style={styles.imageHeader}>CNIC Back</div>
                    <div style={styles.imageWrapper}>
                      {selectedApp.cnicBackUrl ? (
                        <img src={`https://localhost:7149/${selectedApp.cnicBackUrl}`} alt="Back" style={styles.docImage}/>
                      ) : <div style={styles.noImage}>No Image</div>}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* --- SMART FOOTER: ALLOWS CHANGING DECISION --- */}
            <div style={styles.modalFooter}>
              
              {/* CASE 1: PENDING (Show Both Options) */}
              {selectedApp.status === 'Pending' && (
                <>
                  <button 
                    style={styles.rejectButton} 
                    onClick={() => handleStatusUpdate('Rejected')}
                  >
                    Reject Application
                  </button>
                  <button 
                    style={styles.acceptButton} 
                    onClick={() => handleStatusUpdate('Accepted')}
                  >
                    Shortlist Candidate
                  </button>
                </>
              )}

              {/* CASE 2: ALREADY ACCEPTED (Allow Rejection / Change Mind) */}
              {selectedApp.status === 'Accepted' && (
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
                   <span style={{color:'#15803d', fontWeight:'700', fontSize:'14px', display:'flex', alignItems:'center'}}>
                     ✅ Currently Shortlisted
                   </span>
                   <button 
                      style={styles.rejectButton} 
                      onClick={() => handleStatusUpdate('Rejected')}
                   >
                      Change to Rejected
                   </button>
                </div>
              )}

              {/* CASE 3: ALREADY REJECTED (Allow Reconsideration) */}
              {selectedApp.status === 'Rejected' && (
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%'}}>
                   <span style={{color:'#b91c1c', fontWeight:'700', fontSize:'14px', display:'flex', alignItems:'center'}}>
                     ❌ Currently Rejected
                   </span>
                   <button 
                      style={styles.acceptButton} 
                      onClick={() => handleStatusUpdate('Accepted')}
                   >
                      Reconsider (Shortlist)
                   </button>
                </div>
              )}

            </div>
            {/* ---------------------------------------------- */}

          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {previewImage && (
        <div style={styles.lightboxOverlay} onClick={closeZoom}>
          <div style={styles.lightboxContent}>
            <div style={styles.lightboxControls}>
              <button style={styles.controlButton} onClick={toggleZoomLevel}>
                {isZoomed ? <ZoomOut size={24}/> : <ZoomIn size={24}/>}
                <span style={{marginLeft:8, fontSize:14}}>{isZoomed ? "Zoom Out" : "Zoom In"}</span>
              </button>
              <button style={styles.closeLightbox} onClick={closeZoom}><X size={28}/></button>
            </div>
            <img 
              src={previewImage} 
              alt="Zoomed" 
              style={isZoomed ? styles.zoomedImage : styles.fitImage}
              onClick={toggleZoomLevel} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: { padding: '24px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  headerRow: { marginBottom: '32px' },
  pageTitle: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardLabel: { color: '#64748b', fontSize: '14px', marginBottom: '8px' },
  cardNumber: { fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' },
  tableContainer: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  th: { padding: '16px', textAlign: 'left', fontSize: '13px', textTransform: 'uppercase', fontWeight: '600', color: '#64748b', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f1f5f9' },
  td: { padding: '16px', fontSize: '14px', verticalAlign: 'middle' },
  applicantName: { fontWeight: '600', color: '#1e293b' },
  applicantEmail: { fontSize: '12px', color: '#64748b' },
  badge: { padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' },
  badgePending: { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' },
  badgeAccepted: { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #dcfce7' },
  badgeRejected: { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fee2e2' },
  actionButton: { display: 'flex', alignItems: 'center', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500', marginLeft: 'auto', fontSize:'13px' },
  centerMessage: { padding: '40px', textAlign: 'center', color: '#64748b' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', borderRadius: '16px', width: '95%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' },
  modalHeader: { padding: '24px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'start', backgroundColor: '#fff' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' },
  modalSubtitle: { margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', borderRadius:'4px', transition: 'background 0.2s' },
  modalBody: { padding: '32px', backgroundColor: '#fff' },
  infoSection: { backgroundColor: '#f8fafc', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e2e8f0' },
  docsSection: { padding: '0 8px' },
  sectionTitle: { fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems:'center' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px 48px' },
  infoItem: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', color: '#64748b', marginBottom: '6px', letterSpacing:'0.5px', display:'flex', alignItems:'center' },
  value: { fontSize: '15px', fontWeight: '500', color: '#0f172a' },
  imageGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  imageCard: { border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer' },
  imageHeader: { padding: '10px', fontSize: '12px', fontWeight: '600', color: '#475569', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'center' },
  imageWrapper: { padding: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', position: 'relative' },
  docImage: { width: '100%', height: '160px', objectFit: 'contain', borderRadius: '4px', backgroundColor: '#f1f5f9' },
  noImage: { height: '160px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize:'14px' },
  modalFooter: { padding: '24px 32px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' },
  rejectButton: { padding: '10px 24px', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize:'14px', transition: 'all 0.2s' },
  acceptButton: { padding: '10px 24px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize:'14px', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)', transition: 'all 0.2s' },
  lightboxOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'zoom-out' },
  lightboxContent: { width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'auto' },
  fitImage: { maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'zoom-in', transition: 'transform 0.3s ease' },
  zoomedImage: { width: 'auto', height: 'auto', minWidth: '100vw', cursor: 'zoom-out', transform: 'scale(1.5)', transition: 'transform 0.3s ease' },
  lightboxControls: { position: 'absolute', top: '20px', right: '30px', zIndex: 2001, display: 'flex', gap: '16px', alignItems: 'center' },
  controlButton: { display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '8px 16px', borderRadius: '30px', cursor: 'pointer', backdropFilter: 'blur(4px)' },
  closeLightbox: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }
};

export default ApplicationsATS;