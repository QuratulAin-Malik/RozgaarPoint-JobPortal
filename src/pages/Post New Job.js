import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import { 
  Briefcase, MapPin, DollarSign, Clock, 
  AlignLeft, Mail, Phone, User, Star, 
  ShieldCheck, Calendar, CheckCircle, ArrowLeft,
  ShieldAlert, ChevronRight 
} from 'lucide-react';

const PostNewJob = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  
  // --- BARRIER STATE ---
  // We check the status immediately from localStorage to prevent "flickering" of the form
  const [isVerified, setIsVerified] = useState(localStorage.getItem('verificationStatus') === 'verified');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // --- STATE ---
  const [jobData, setJobData] = useState({
    id: 0,
    OrganizationName: '',
    JobTitle: '',
    JobDescription: '',
    Salary: '',
    ContactEmail: '',
    ContactPhone: '',
    Location: '',
    Skills: '',
    JobTiming: 'Full Time',
    Status: 'Active',
    IsCnicRequired: false,
    AgeRange: '',
    GenderPreference: 'No Preference',
    ExperienceLevel: 'Fresh'
  });

  // --- 1. SECURITY & LIVE DATA SYNC ---
  useEffect(() => {
    const performLiveVerification = async () => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            navigate('/login');
            return;
        }

        try {
            // 1. Ask the Backend for the REAL status from the database for THIS ID
            const response = await fetch(`https://localhost:7149/api/EmployerDocs/status/${userId}`);
            
            if (response.ok) {
                const data = await response.json();
                const dbStatus = data.status.toLowerCase();

                // 2. Sync State and LocalStorage with the Database truth
                const verified = dbStatus === 'verified';
                setIsVerified(verified);
                setShowVerificationModal(!verified);
                localStorage.setItem('verificationStatus', dbStatus);

                // If NOT verified, stop further data fetching
                if (!verified) return; 
            }
        } catch (err) {
            console.error("Live Verification Failed:", err);
            // Fallback barrier if the API is down
            if (localStorage.getItem('verificationStatus') !== 'verified') {
                setIsVerified(false);
                setShowVerificationModal(true);
                return;
            }
        }

        // B. Fetch Data if Edit Mode (Only runs if verified in database)
        if (isEditMode) {
          setLoading(true);
          fetch(`https://localhost:7149/api/JobPosting/${id}`)
            .then(res => {
              if (!res.ok) throw new Error("Job not found");
              return res.json();
            })
            .then(data => {
                setJobData({
                    id: data.id,
                    OrganizationName: data.organizationName,
                    JobTitle: data.jobTitle,
                    JobDescription: data.jobDescription, 
                    Salary: data.salary,
                    ContactEmail: data.contactEmail,
                    ContactPhone: data.contactPhone || '',
                    Location: data.location,
                    Skills: data.skills,                
                    JobTiming: data.jobTiming,
                    Status: data.status,
                    IsCnicRequired: data.isCnicRequired || false,
                    AgeRange: data.ageRange || '',
                    GenderPreference: data.genderPreference || 'No Preference',
                    ExperienceLevel: data.experienceLevel || 'Fresh'
                });
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                navigate('/job-management');
            });
        }
    };

    performLiveVerification();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData({ 
        ...jobData, 
        [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleJobType = (type) => {
    setJobData({ ...jobData, JobTiming: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = localStorage.getItem('userId');
    if (!userId) { navigate('/login'); return; }

    const payload = { 
        ...jobData, 
        Salary: parseFloat(jobData.Salary),
        EmployerId: parseInt(userId)
    };

    try {
      const url = isEditMode 
        ? `https://localhost:7149/api/JobPosting/${id}`
        : 'https://localhost:7149/api/JobPosting';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 204) {
        alert(isEditMode ? 'Job Updated Successfully!' : 'Job Posted Successfully!');
        navigate('/dashboard'); 
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData);
        alert('Failed to save job. Please check all fields.');
      }
    } catch (error) {
      alert('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // THE BARRIER: IF NOT VERIFIED, SHOW ONLY THE MODAL AND RETURN
  // ================================================================
  if (!isVerified) {
    return (
      <div style={styles.modalOverlay}>
         <style>{`
            @keyframes popIn {
                0% { transform: scale(0.9); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
         `}</style>
        <div style={styles.modalContent}>
            <div style={styles.modalIconCircle}>
                <ShieldAlert size={40} color="#DC2626" />
            </div>
            <h2 style={styles.modalTitle}>Verification Required</h2>
            <p style={styles.modalText}>
                To ensure the safety of our candidates, only verified recruiters can post jobs. 
                Please complete your profile and upload identity documents to proceed.
            </p>
            
            <button 
                onClick={() => navigate('/profile-settings')}
                style={styles.modalButton}
            >
                Complete Profile & Verify <ChevronRight size={18} />
            </button>
            
            <button 
                onClick={() => navigate('/dashboard')}
                style={styles.modalSecondaryButton}
            >
                Return to Dashboard
            </button>
        </div>
      </div>
    );
  }

  // ================================================================
  // MAIN FORM RENDER (Only accessible if isVerified is true)
  // ================================================================
  return (
    <div style={styles.pageContainer}>
      
      <style>{`
        .input-field:focus, .textarea-field:focus, .select-field:focus {
          background-color: #ffffff !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .toggle-btn:hover { background-color: #e0f2fe !important; color: #0284c7 !important; }
        .submit-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4) !important; }
        .back-btn:hover { background-color: #e2e8f0; }
      `}</style>

      <div style={{width:'100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div style={styles.navBar}>
            <button onClick={() => navigate(-1)} style={styles.backButton} className="back-btn">
                <ArrowLeft size={20} /> Back to Dashboard
            </button>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
                <div style={styles.iconHeader}>
                    {isEditMode ? <Briefcase size={32} color="white"/> : <Star size={32} color="white"/>}
                </div>
                <div>
                    <h2 style={styles.headerTitle}>
                        {isEditMode ? 'Edit Job Posting' : 'Create New Job Post'}
                    </h2>
                    <p style={styles.headerSubtitle}>
                        {isEditMode ? 'Refine your job details below.' : 'Fill in the details to find the perfect candidate.'}
                    </p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} autoComplete="off">
              <input type="text" style={{display: 'none'}} />
              <input type="password" style={{display: 'none'}} />
              
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                    <span style={styles.sectionIconBg}><Briefcase size={18} color="#2563eb"/></span> 
                    Job Details
                </h3>
                <div style={styles.gridRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Job Title</label>
                    <input type="text" name="JobTitle" value={jobData.JobTitle} onChange={handleChange} style={styles.input} className="input-field" placeholder="e.g. Senior Chef" required autoComplete="new-password" />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Organization Name</label>
                    <input type="text" name="OrganizationName" value={jobData.OrganizationName} onChange={handleChange} style={styles.input} className="input-field" placeholder="e.g. Foodies Hub" required autoComplete="new-password"/>
                  </div>
                </div>

                <div style={styles.toggleContainer}>
                  <span style={styles.toggleLabel}>Job Type</span>
                  <div style={styles.toggleGroup}>
                      {['Full Time', 'Part Time', 'Contract', 'Daily Wage'].map((type) => (
                        <button key={type} type="button" onClick={() => handleJobType(type)} className="toggle-btn" style={jobData.JobTiming === type ? styles.toggleBtnActive : styles.toggleBtn}>{type}</button>
                      ))}
                  </div>
                </div>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                    <span style={styles.sectionIconBg}><ShieldCheck size={18} color="#2563eb"/></span> 
                    Candidate Requirements
                </h3>
                <div style={styles.checkboxWrapper}>
                    <input type="checkbox" id="cnicCheck" name="IsCnicRequired" checked={jobData.IsCnicRequired} onChange={handleChange} style={styles.checkbox}/>
                    <label htmlFor="cnicCheck" style={styles.checkboxLabel}>Require Valid CNIC Card <span style={{fontWeight:400, color:'#64748b'}}>(Recommended for trust)</span></label>
                </div>
                <div style={styles.gridRowThree}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Age Range</label>
                        <div style={styles.iconInputWrapper}><Calendar size={18} style={styles.inputIcon} /><input type="text" name="AgeRange" value={jobData.AgeRange} onChange={handleChange} style={styles.iconInput} className="input-field" placeholder="e.g. 20-35"/></div>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Gender Preference</label>
                        <div style={styles.iconInputWrapper}><User size={18} style={styles.inputIcon} /><select name="GenderPreference" value={jobData.GenderPreference} onChange={handleChange} style={styles.iconSelect} className="select-field"><option value="No Preference">No Preference</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Experience Level</label>
                        <div style={styles.iconInputWrapper}><Star size={18} style={styles.inputIcon} /><select name="ExperienceLevel" value={jobData.ExperienceLevel} onChange={handleChange} style={styles.iconSelect} className="select-field"><option value="Fresh">Fresh</option><option value="Less than 1 Year">Less than 1 Year</option><option value="1-2 Years">1-2 Years</option><option value="3-5 Years">3-5 Years</option><option value="5+ Years">5+ Years</option></select></div>
                    </div>
                </div>
                <div style={{...styles.inputGroup, marginTop: '20px'}}>
                    <label style={styles.label}>Required Skills (Comma separated)</label>
                    <input type="text" name="Skills" value={jobData.Skills} onChange={handleChange} style={styles.input} className="input-field" placeholder="e.g. Driving, Cooking, Cleaning" required autoComplete="new-password"/>
                </div>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>
                    <span style={styles.sectionIconBg}><MapPin size={18} color="#2563eb"/></span> Location & Compensation
                </h3>
                <div style={styles.gridRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Location (City/Area)</label>
                    <input type="text" name="Location" value={jobData.Location} onChange={handleChange} style={styles.input} className="input-field" required autoComplete="new-password"/>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Salary (PKR)</label>
                    <div style={styles.iconInputWrapper}><DollarSign size={18} style={styles.inputIcon} /><input type="number" name="Salary" value={jobData.Salary} onChange={handleChange} style={styles.iconInput} className="input-field" required autoComplete="new-password"/></div>
                  </div>
                </div>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}><span style={styles.sectionIconBg}><Mail size={18} color="#2563eb"/></span> Contact & Description</h3>
                <div style={styles.gridRow}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input type="email" name="ContactEmail" value={jobData.ContactEmail} onChange={handleChange} style={styles.input} className="input-field" required autoComplete="new-password"/>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone (Optional)</label>
                    <input type="tel" name="ContactPhone" value={jobData.ContactPhone} onChange={handleChange} style={styles.input} className="input-field" autoComplete="new-password" placeholder="0300-1234567"/>
                    <span style={{fontSize: '12px', color: '#64748b', marginTop: '6px', display:'flex', alignItems:'center', gap:'5px'}}><Phone size={12}/> Providing a number allows candidates to call you directly.</span>
                  </div>
                </div>
                <div style={{marginTop: '20px'}}>
                  <label style={styles.label}>Detailed Job Description</label>
                  <textarea name="JobDescription" value={jobData.JobDescription} onChange={handleChange} style={styles.textarea} className="textarea-field" placeholder="Describe the roles..." required />
                </div>
              </div>

              <button type="submit" style={styles.publishBtn} className="submit-btn" disabled={loading}>{loading ? 'Processing...' : (isEditMode ? '💾 Save Changes' : '🚀 Publish Job Now')}</button>
            </form>
          </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageContainer: { backgroundColor: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', fontFamily: "'Inter', sans-serif" },
  navBar: { width: '100%', maxWidth: '850px', marginBottom: '20px', display: 'flex', justifyContent: 'flex-start' },
  backButton: { background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', transition: 'all 0.2s' },
  card: { backgroundColor: '#ffffff', width: '100%', maxWidth: '850px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', padding: '0', border: '1px solid #f1f5f9', overflow: 'hidden' },
  cardHeader: { background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', padding: '40px', display: 'flex', alignItems: 'center', gap: '20px', color: 'white' },
  iconHeader: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '16px', backdropFilter: 'blur(5px)' },
  headerTitle: { fontSize: '28px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
  headerSubtitle: { fontSize: '15px', color: '#dbeafe', margin: 0, fontWeight: '400' },
  section: { padding: '30px 40px' },
  divider: { height: '1px', backgroundColor: '#f1f5f9', width: '100%' },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' },
  sectionIconBg: { width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  gridRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
  gridRowThree: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s ease', width: '100%', boxSizing: 'border-box' },
  iconInputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#94a3b8', pointerEvents: 'none', zIndex: 1 },
  iconInput: { width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', outline: 'none', backgroundColor: '#f8fafc', transition: 'all 0.2s ease', boxSizing: 'border-box' },
  iconSelect: { width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', outline: 'none', backgroundColor: '#f8fafc', cursor: 'pointer', appearance: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b', backgroundColor: '#f8fafc', minHeight: '140px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: '1.6', transition: 'all 0.2s ease', boxSizing: 'border-box' },
  toggleContainer: { marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '10px' },
  toggleLabel: { fontSize: '13px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  toggleGroup: { display: 'flex', backgroundColor: '#f8fafc', padding: '5px', borderRadius: '14px', gap: '5px', border: '1px solid #e2e8f0' },
  toggleBtn: { flex: 1, padding: '12px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer', borderRadius: '10px', transition: 'all 0.2s' },
  toggleBtnActive: { flex: 1, padding: '12px', border: 'none', backgroundColor: '#ffffff', color: '#2563eb', fontSize: '14px', fontWeight: '700', cursor: 'pointer', borderRadius: '10px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  checkboxWrapper: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe', marginBottom: '25px' },
  checkbox: { width: '20px', height: '20px', cursor: 'pointer', accentColor: '#2563eb' },
  checkboxLabel: { fontSize: '15px', fontWeight: '600', color: '#1e40af', cursor: 'pointer' },
  publishBtn: { width: 'calc(100% - 80px)', margin: '0 40px 40px 40px', padding: '18px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontSize: '16px', fontWeight: '700', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)', transition: 'all 0.3s ease' },

  // --- MODAL STYLES (THE BARRIER) ---
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    backdropFilter: 'blur(8px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: 'white', padding: '40px', borderRadius: '24px',
    width: '90%', maxWidth: '450px',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  modalIconCircle: {
    width: '80px', height: '80px', backgroundColor: '#FEF2F2',
    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px auto', border: '8px solid #FFF1F2'
  },
  modalTitle: { fontSize: '22px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px 0' },
  modalText: { fontSize: '15px', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' },
  modalButton: {
    width: '100%', backgroundColor: '#DC2626', color: 'white',
    padding: '16px', borderRadius: '12px', border: 'none',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)', marginBottom: '12px'
  },
  modalSecondaryButton: {
    width: '100%', backgroundColor: 'transparent', color: '#64748b',
    padding: '12px', borderRadius: '12px', border: 'none',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  }
};

export default PostNewJob;