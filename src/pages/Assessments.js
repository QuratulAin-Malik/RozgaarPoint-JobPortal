import React, { useEffect, useState } from 'react';
import { Star, Award, Clock, ThumbsUp, Shield, Edit3 } from 'lucide-react';

const Assessments = () => {
  const [hiredWorkers, setHiredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    fetchHiredWorkers();
  }, []);

  const fetchHiredWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7149/api/JobApplication/employer-applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("Failed to load workers");

      const data = await response.json();
      console.log("Loaded Workers:", data); 

      const acceptedOnly = data.filter(app => app.status === 'Accepted');
      setHiredWorkers(acceptedOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (worker) => {
    setSelectedWorker(worker);
    // Handle both Uppercase (Rating) and lowercase (rating) from API
    const existingRating = worker.rating || worker.Rating || 0;
    const existingBadge = worker.badge || worker.Badge || null;

    setRating(existingRating);
    setSelectedBadge(existingBadge);
    setShowModal(true);
  };

  // --- FIXED SUBMIT FUNCTION ---
  const handleSubmitFeedback = async () => {
    if (!selectedBadge || rating === 0) {
      alert("Please select a badge and a star rating.");
      return;
    }

    try {
      console.log(`Submitting Assessment for App ID: ${selectedWorker.applicationId}`); 

      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:7149/api/JobApplication/submit-assessment/${selectedWorker.applicationId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: rating,
          badge: selectedBadge
        })
      });

      if (response.ok) {
        // 1. Show Success Alert
        alert(`Success! Review saved for ${selectedWorker.applicantName}.`);
        
        // 2. Close Modal
        setShowModal(false);
        
        // 3. Refresh the list to show the new stars immediately
        await fetchHiredWorkers(); 
      } else {
        const errorText = await response.text();
        console.error("Server Error:", errorText);
        alert(`Failed to save. Server said: ${errorText}`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert("Error connecting to server. Is the backend running?");
    }
  };

  const badges = [
    { id: 'Punctual', icon: <Clock size={20}/>, color: '#3b82f6', label: 'Always Punctual' },
    { id: 'Skilled', icon: <Star size={20}/>, color: '#eab308', label: 'Highly Skilled' },
    { id: 'Polite', icon: <ThumbsUp size={20}/>, color: '#22c55e', label: 'Polite Behavior' },
    { id: 'Hardworking', icon: <Shield size={20}/>, color: '#a855f7', label: 'Hard Worker' },
  ];

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={16} fill={i < count ? "#eab308" : "none"} color={i < count ? "#eab308" : "#cbd5e1"} />
    ));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Performance Assessments</h1>
        <p style={styles.subtitle}>Rate and award badges to your hired workers.</p>
      </div>

      {loading ? <p>Loading hired workers...</p> : (
        <div style={styles.grid}>
          {hiredWorkers.length === 0 ? (
            <div style={styles.emptyState}>
              <Award size={48} color="#cbd5e1"/>
              <p>No hired workers yet. Shortlist candidates in ATS first.</p>
            </div>
          ) : (
            hiredWorkers.map((worker) => {
              // Robust check for rating (handles CamelCase or PascalCase)
              const currentRating = worker.rating || worker.Rating || 0;
              const currentBadge = worker.badge || worker.Badge || null;
              const isRated = currentRating > 0;

              return (
                <div key={worker.applicationId} style={styles.card}>
                  <div style={styles.cardHeader}>
                    
                    {/* --- NEW: REAL SELFIE LOGIC ADDED HERE --- */}
                    {worker.selfieUrl ? (
                      <img 
                        src={`https://localhost:7149/${worker.selfieUrl}`} 
                        alt="Profile"
                        style={{
                          width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginRight: '15px', border: '2px solid #e2e8f0'
                        }}
                      />
                    ) : (
                      <div style={styles.avatarPlaceholder}>{worker.applicantName.charAt(0)}</div>
                    )}
                    {/* ----------------------------------------- */}

                    <div>
                      <h3 style={styles.workerName}>{worker.applicantName}</h3>
                      <p style={styles.jobTitle}>{worker.jobTitle}</p>
                    </div>
                  </div>
                  
                  <div style={styles.cardBody}>
                    <div style={styles.row}>
                      <span style={styles.label}>Status:</span>
                      <span style={{color:'green', fontWeight:'bold', fontSize:'14px'}}>Hired</span>
                    </div>
                    
                    {/* Dynamic Rating Section */}
                    {isRated ? (
                      <div style={styles.ratingContainer}>
                        <div style={styles.starRow}>
                          {renderStars(currentRating)}
                          <span style={styles.ratingText}>({currentRating}/5)</span>
                        </div>
                        {currentBadge && (
                          <div style={styles.assignedBadge}>
                            <Award size={14} style={{marginRight:4}}/> {currentBadge}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={styles.pendingText}>Pending Assessment</p>
                    )}
                  </div>

                  <button 
                    style={isRated ? styles.editButton : styles.assessButton}
                    onClick={() => openFeedbackModal(worker)}
                  >
                    {isRated ? (
                      <> <Edit3 size={16} style={{marginRight:8}}/> Update Review </>
                    ) : (
                      <> <Award size={18} style={{marginRight:8}}/> Give Badge & Review </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL */}
      {showModal && selectedWorker && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Rate {selectedWorker.applicantName}</h2>
            <div style={styles.section}>
              <p style={styles.label}>Rate Performance</p>
              <div style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} size={32} 
                    fill={star <= rating ? "#eab308" : "none"} 
                    color={star <= rating ? "#eab308" : "#cbd5e1"}
                    style={{cursor:'pointer', marginRight: 8}}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>
            <div style={styles.section}>
              <p style={styles.label}>Award a Badge (Optional)</p>
              <div style={styles.badgeGrid}>
                {badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    style={{
                      ...styles.badgeCard, 
                      borderColor: selectedBadge === badge.label ? badge.color : '#e2e8f0',
                      backgroundColor: selectedBadge === badge.label ? '#f8fafc' : 'white'
                    }}
                    onClick={() => setSelectedBadge(badge.label)}
                  >
                    <div style={{color: badge.color, marginBottom: 5}}>{badge.icon}</div>
                    <span style={styles.badgeText}>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={styles.submitButton} onClick={handleSubmitFeedback}>Submit Assessment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES (Same as before) ---
const styles = {
  container: { padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: "'Inter', sans-serif" },
  header: { marginBottom: '30px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b' },
  subtitle: { color: '#64748b', marginTop: '5px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' },
  cardHeader: { display: 'flex', alignItems: 'center', marginBottom: '16px' },
  avatarPlaceholder: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', marginRight: '15px' },
  workerName: { margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' },
  jobTitle: { margin: 0, fontSize: '14px', color: '#64748b' },
  cardBody: { marginBottom: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', flexGrow: 1 },
  row: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  label: { fontSize: '14px', color: '#64748b' },
  ratingContainer: { marginTop: '10px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' },
  starRow: { display: 'flex', alignItems: 'center', marginBottom: '5px' },
  ratingText: { marginLeft: '8px', fontSize: '12px', fontWeight: 'bold', color: '#334155' },
  assignedBadge: { display: 'inline-flex', alignItems: 'center', fontSize: '12px', color: '#0f172a', backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: '500' },
  pendingText: { fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', marginTop: '10px' },
  assessButton: { width: '100%', padding: '10px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500', marginTop: 'auto' },
  editButton: { width: '100%', padding: '10px', backgroundColor: 'white', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', marginTop: 'auto' },
  emptyState: { gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94a3b8', backgroundColor: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalTitle: { margin: '0 0 5px 0', fontSize: '22px', color: '#1e293b' },
  section: { marginTop: '25px' },
  stars: { display: 'flex' },
  badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' },
  badgeCard: { border: '2px solid #e2e8f0', borderRadius: '10px', padding: '15px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.2s' },
  badgeText: { fontSize: '13px', fontWeight: '600', color: '#475569' },
  modalFooter: { marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelButton: { padding: '10px 20px', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '8px', cursor: 'pointer' },
  submitButton: { padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }
};

export default Assessments;