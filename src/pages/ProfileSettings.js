import React, { useState, useEffect } from 'react';
import { 
  User, ShieldCheck, Camera, Grid, Bell, 
  CheckCircle, AlertCircle, Loader2, Lock, Save,
  Mail, MapPin, Globe, Briefcase, Trash2, LogOut, 
  FileText, UploadCloud, Monitor, FileBadge, Building, Home,
  RefreshCw // Added icon for reset
} from 'lucide-react'; 

const ProfileSettings = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('profile'); 
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // 1. EMPLOYER TYPE & STATUS
  const [employerType, setEmployerType] = useState('individual'); 
  const [verificationStatus, setVerificationStatus] = useState('unverified'); 

  // DATA STATE
  const [formData, setFormData] = useState({
    fullName: '', email: '', contactNumber: '', location: '', bio: '',
    orgName: '', website: '', industry: '', companySize: '1-10', 
    imagePreview: null  
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  // 2. EXTENDED DOCUMENTS STATE
  const [docs, setDocs] = useState({
      cnicFront: null,
      cnicBack: null,          
      utilityBill: null,       
      ntnCertificate: null,    
      bizAddressProof: null,   
      authLetter: null         
  });

  // --- NEW: PREVIEWS STATE (To show images) ---
  const [previews, setPreviews] = useState({
      cnicFront: null,
      cnicBack: null,
      utilityBill: null,
      ntnCertificate: null,
      bizAddressProof: null,
      authLetter: null
  });

  // --- FETCH DATA (Updated for UserID Sync) ---
  useEffect(() => {
    const syncUserStatus = async () => {
        setLoading(true);
        
        // 1. Get the real ID from whoever is logged in
        const currentUserId = localStorage.getItem('userId');
        
        if (currentUserId) {
            try {
                // 2. Ask the Backend for the real SQL status
                const response = await fetch(`https://localhost:7149/api/EmployerDocs/status/${currentUserId}`);
                if (response.ok) {
                    const data = await response.json();
                    const realStatus = data.status.toLowerCase();
                    
                    // 3. Update the UI state with the real Database value
                    setVerificationStatus(realStatus);
                    localStorage.setItem('verificationStatus', realStatus);
                }
            } catch (err) {
                console.error("Failed to sync status:", err);
            }
        }

        // --- Keep existing local data logic ---
        const storedType = localStorage.getItem('employerType') || 'individual';
        const storedName = localStorage.getItem('userName') || 'Ali Khan';

        setEmployerType(storedType);
        
        setFormData(prev => ({
            ...prev, 
            fullName: storedName,
            email: 'ali@example.com',
            contactNumber: '0300-1234567',
            location: 'Taxila, Pakistan',
            bio: 'Recruiting for my local office.',
            orgName: 'TechSolutions Inc'
        }));

        setLoading(false);
    };

    syncUserStatus();
    
    // Cleanup previews on unmount to avoid memory leaks
    return () => {
        Object.values(previews).forEach(url => {
            if(url) URL.revokeObjectURL(url);
        });
    };
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // New Handler for Security Inputs
  const handleSecurityChange = (e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value });

  const handleTypeChange = (type) => {
      setEmployerType(type);
      localStorage.setItem('employerType', type);
  };

  // --- UPDATED: HANDLE FILE CHANGE WITH PREVIEW ---
  const handleFileChange = (e, fieldName) => {
      const file = e.target.files[0];
      if(file) {
          // 1. Update File State
          setDocs(prev => ({ ...prev, [fieldName]: file }));
          
          // 2. Create Preview URL
          const objectUrl = URL.createObjectURL(file);
          setPreviews(prev => ({ ...prev, [fieldName]: objectUrl }));
      }
  };

  // --- ACTIONS ---
  
  const handleSaveProfile = () => {
      setSaving(true);
      setTimeout(() => {
          setSaving(false);
          setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }, 1000);
  };

  // ==========================================================
  //  NEW: RESET VERIFICATION HANDLER
  // ==========================================================
  const handleResetVerification = async () => {
      if (!window.confirm("This will delete your current submission and allow you to upload again. Proceed?")) return;
      
      setSaving(true);
      const currentUserId = localStorage.getItem('userId');

      try {
          const response = await fetch(`https://localhost:7149/api/EmployerDocs/reset/${currentUserId}`, {
              method: 'DELETE'
          });

          if (response.ok) {
              setVerificationStatus('unverified');
              localStorage.setItem('verificationStatus', 'unverified');
              setMessage({ type: 'success', text: 'Verification reset. You can now re-upload your documents.' });
          } else {
              alert("Failed to reset verification status.");
          }
      } catch (error) {
          console.error("Reset Error:", error);
          alert("Network error. Please check your backend.");
      } finally {
          setSaving(false);
      }
  };

  // ==========================================================
  //  REAL API UPLOAD HANDLER (Synchronized with Logged-in User)
  // ==========================================================
  const handleSubmitVerification = async () => {
      // 1. Validation
      if (!docs.cnicFront || !docs.cnicBack) {
          alert("Error: Please upload both Front and Back of CNIC.");
          return;
      }

      if (employerType === 'individual' && !docs.utilityBill) {
          alert("Error: Home Utility Bill is required.");
          return;
      }
      
      setSaving(true);
      setMessage({ type: '', text: '' });

      // --- DYNAMIC USER SYNC ---
      const currentEmployerId = localStorage.getItem('userId'); 

      if (!currentEmployerId) {
          alert("Session Error: Please log out and log in again to sync your account ID.");
          setSaving(false);
          return;
      }

      const API_URL = 'https://localhost:7149/api/EmployerDocs/upload';

      const uploadFile = async (file, docType) => {
          if (!file) return;

          const formData = new FormData();
          formData.append('employerId', currentEmployerId);
          formData.append('docType', docType);
          formData.append('file', file);

          const response = await fetch(API_URL, {
              method: 'POST',
              body: formData 
          });

          if (!response.ok) {
              const text = await response.text();
              throw new Error(text || `Failed to upload ${docType}`);
          }
      };

      try {
          // 2. Upload Files Sequentially
          if (docs.cnicFront) await uploadFile(docs.cnicFront, 'CNIC_Front');
          if (docs.cnicBack) await uploadFile(docs.cnicBack, 'CNIC_Back');

          if (employerType === 'individual') {
              if (docs.utilityBill) await uploadFile(docs.utilityBill, 'Utility_Bill');
          } else {
              if (docs.ntnCertificate) await uploadFile(docs.ntnCertificate, 'NTN_Cert');
              if (docs.bizAddressProof) await uploadFile(docs.bizAddressProof, 'Biz_Address');
              if (docs.authLetter) await uploadFile(docs.authLetter, 'Auth_Letter');
          }

          // 3. Success State (SET TO PENDING FOR ADMIN REVIEW)
          setVerificationStatus('pending');
          localStorage.setItem('verificationStatus', 'pending'); 
          setMessage({ type: 'success', text: 'Documents uploaded! Admin will verify your account shortly.' });

      } catch (error) {
          console.error("Upload Error:", error);
          setMessage({ type: 'error', text: 'Upload failed. Check if Backend is running.' });
      } finally {
          setSaving(false);
      }
  };

  // --- NEW: PASSWORD UPDATE HANDLER ---
  const handleUpdatePassword = () => {
      const { currentPassword, newPassword, confirmPassword } = securityData;

      if (!currentPassword || !newPassword || !confirmPassword) {
          setMessage({ type: 'error', text: 'All password fields are required.' });
          return;
      }

      if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match.' });
          return;
      }

      setSaving(true);
      // Simulate API call
      setTimeout(() => {
          setSaving(false);
          setMessage({ type: 'success', text: 'Password changed successfully.' });
          setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' }); // Reset fields
      }, 1500);
  };

  // --- NEW: LOGOUT HANDLER ---
  const handleLogout = () => {
      if (window.confirm("Are you sure you want to log out?")) {
          // 1. Clear Local Storage
          localStorage.clear();
          // 2. Redirect to Login (Adjust path as needed)
          window.location.href = '/login'; 
      }
  };

  // --- NEW: DELETE ACCOUNT HANDLER ---
  const handleDeleteAccount = () => {
      if (window.confirm("WARNING: This is permanent! Are you sure you want to delete your account?")) {
          setSaving(true);
          // Simulate API call
          setTimeout(() => {
              localStorage.clear();
              alert("Account deleted.");
              window.location.href = '/register'; // Redirect to signup
          }, 1500);
      }
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        .tab-btn:hover { color: #2563EB; background-color: #EFF6FF; }
        .upload-box:hover { border-color: #2563EB; background-color: #F8FAFC; }
        .input-field:focus { border-color: #2563EB !important; background-color: #fff !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1); }
      `}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <div>
            <h2 style={styles.pageTitle}>Profile & Settings</h2>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                <span style={styles.pageSubtitle}>Manage your account</span>
                {verificationStatus === 'verified' && <span style={styles.verifiedTag}>Verified <CheckCircle size={10}/></span>}
                {verificationStatus === 'pending' && <span style={styles.pendingTag}>Verification Pending</span>}
                {verificationStatus === 'unverified' && <span style={styles.unverifiedTag}>Unverified</span>}
            </div>
        </div>
      </header>

      {/* CONTENT */}
      <div style={styles.contentArea}>
        <div style={styles.card}>
          
          {/* TABS */}
          <div style={styles.tabHeader}>
            <button onClick={() => setActiveTab('profile')} className="tab-btn" style={activeTab === 'profile' ? styles.tabActive : styles.tabInactive}>
              <User size={18} style={{marginRight:8}}/> Public Profile
            </button>
            <button onClick={() => setActiveTab('verification')} className="tab-btn" style={activeTab === 'verification' ? styles.tabActive : styles.tabInactive}>
              <FileText size={18} style={{marginRight:8}}/> Verification
            </button>
            <button onClick={() => setActiveTab('security')} className="tab-btn" style={activeTab === 'security' ? styles.tabActive : styles.tabInactive}>
              <ShieldCheck size={18} style={{marginRight:8}}/> Security
            </button>
          </div>

          <div style={{ padding: '32px' }}>
                {message.text && (
                    <div style={{padding: '12px', borderRadius:'8px', marginBottom:'20px', backgroundColor: message.type==='error'?'#FEF2F2':'#EFF6FF', color: message.type==='error'?'#DC2626':'#2563EB', border: '1px solid #BFDBFE', display:'flex', alignItems:'center', gap:'8px'}}>
                        {message.type==='error'?<AlertCircle size={16}/>:<CheckCircle size={16}/>} {message.text}
                    </div>
                )}

                {/* === TAB 1: PROFILE === */}
                {activeTab === 'profile' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={styles.toggleContainer}>
                        <button onClick={() => handleTypeChange('individual')} style={employerType === 'individual' ? styles.toggleActive : styles.toggleInactive}>Individual / Household</button>
                        <button onClick={() => handleTypeChange('company')} style={employerType === 'company' ? styles.toggleActive : styles.toggleInactive}>Company / Organization</button>
                    </div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={styles.gridRow}>
                            <div style={{flex: 1}}><label style={styles.label}>Full Name</label><input type="text" name="fullName" style={styles.input} className="input-field" value={formData.fullName} onChange={handleInputChange}/></div>
                            <div style={{flex: 1}}><label style={styles.label}>Email</label><input style={{...styles.input, backgroundColor:'#F9FAFB', color:'#6B7280'}} value={formData.email} readOnly/></div>
                        </div>
                        <div style={styles.gridRow}>
                            <div style={{flex: 1}}><label style={styles.label}>Contact Number</label><input style={{...styles.input, backgroundColor:'#F9FAFB', color:'#6B7280'}} value={formData.contactNumber} readOnly/></div>
                            <div style={{flex: 1}}><label style={styles.label}>Location</label><input type="text" name="location" style={styles.input} className="input-field" value={formData.location} onChange={handleInputChange}/></div>
                        </div>
                        {employerType === 'company' && (
                            <div style={styles.companyBox}>
                                <h4 style={{margin:'0 0 15px 0', fontSize:'14px', fontWeight:'700', color:'#1e3a8a'}}>Company Details</h4>
                                <div style={styles.gridRow}>
                                    <div style={{flex:1}}><label style={styles.label}>Organization Name</label><input type="text" name="orgName" style={styles.input} className="input-field" value={formData.orgName} onChange={handleInputChange}/></div>
                                    <div style={{flex:1}}><label style={styles.label}>Industry</label><input type="text" name="industry" style={styles.input} className="input-field" placeholder="e.g. IT" onChange={handleInputChange}/></div>
                                </div>
                            </div>
                        )}
                        <button style={styles.saveButton} onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Profile Changes'}</button>
                    </div>
                </div>
                )}

                {/* === TAB 2: VERIFICATION === */}
                {activeTab === 'verification' && (
                    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
                        {verificationStatus === 'unverified' ? (
                            <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                                <div style={{textAlign:'center', marginBottom:'15px'}}>
                                    <h3 style={{fontSize:'18px', fontWeight:'700'}}>Verify as {employerType === 'individual' ? 'Individual' : 'Company'}</h3>
                                    <p style={{fontSize:'14px', color:'#6B7280'}}>
                                        {employerType === 'individual' 
                                            ? "Ensure safety by verifying your identity and home address." 
                                            : "Verify your business legitimacy to hire professionals."}
                                    </p>
                                </div>

                                <h4 style={styles.sectionHeader}>1. Identity Proof</h4>
                                <div style={styles.gridRow}>
                                    <div className="upload-box" style={styles.uploadBox} onClick={() => document.getElementById('cnicF').click()}>
                                        <div style={styles.uploadIcon}>
                                            {previews.cnicFront ? <img src={previews.cnicFront} alt="Doc" style={styles.previewImg}/> : <User size={20}/>}
                                        </div>
                                        <div><p style={styles.uploadTitle}>CNIC Front *</p><p style={styles.uploadSub}>{docs.cnicFront ? docs.cnicFront.name : "Select File"}</p></div>
                                        <input type="file" id="cnicF" hidden onChange={(e)=>handleFileChange(e,'cnicFront')} />
                                    </div>
                                    <div className="upload-box" style={styles.uploadBox} onClick={() => document.getElementById('cnicB').click()}>
                                        <div style={styles.uploadIcon}>
                                             {previews.cnicBack ? <img src={previews.cnicBack} alt="Doc" style={styles.previewImg}/> : <User size={20}/>}
                                        </div>
                                        <div><p style={styles.uploadTitle}>CNIC Back *</p><p style={styles.uploadSub}>{docs.cnicBack ? docs.cnicBack.name : "Select File"}</p></div>
                                        <input type="file" id="cnicB" hidden onChange={(e)=>handleFileChange(e,'cnicBack')} />
                                    </div>
                                </div>

                                {employerType === 'individual' ? (
                                    <>
                                        <h4 style={styles.sectionHeader}>2. Proof of Residence</h4>
                                        <div className="upload-box" style={styles.uploadBox} onClick={() => document.getElementById('util').click()}>
                                            <div style={styles.uploadIcon}>
                                                {previews.utilityBill ? <img src={previews.utilityBill} alt="Doc" style={styles.previewImg}/> : <Home size={20}/>}
                                            </div>
                                            <div><p style={styles.uploadTitle}>Home Utility Bill *</p><p style={styles.uploadSub}>{docs.utilityBill ? docs.utilityBill.name : "Electricity/Gas (Max 3 months old)"}</p></div>
                                            <input type="file" id="util" hidden onChange={(e)=>handleFileChange(e,'utilityBill')} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <h4 style={styles.sectionHeader}>2. Business Verification</h4>
                                        <div className="upload-box" style={styles.uploadBox} onClick={() => document.getElementById('ntn').click()}>
                                            <div style={styles.uploadIcon}>
                                                {previews.ntnCertificate ? <img src={previews.ntnCertificate} alt="Doc" style={styles.previewImg}/> : <FileBadge size={20}/>}
                                            </div>
                                            <div><p style={styles.uploadTitle}>NTN / Incorporation Cert *</p><p style={styles.uploadSub}>{docs.ntnCertificate ? docs.ntnCertificate.name : "Official Gov Certificate"}</p></div>
                                            <input type="file" id="ntn" hidden onChange={(e)=>handleFileChange(e,'ntnCertificate')} />
                                        </div>
                                        <div className="upload-box" style={styles.uploadBox} onClick={() => document.getElementById('bizAddr').click()}>
                                            <div style={styles.uploadIcon}>
                                                {previews.bizAddressProof ? <img src={previews.bizAddressProof} alt="Doc" style={styles.previewImg}/> : <Building size={20}/>}
                                            </div>
                                            <div><p style={styles.uploadTitle}>Office Utility Bill / Lease *</p><p style={styles.uploadSub}>{docs.bizAddressProof ? docs.bizAddressProof.name : "Proof of physical address"}</p></div>
                                            <input type="file" id="bizAddr" hidden onChange={(e)=>handleFileChange(e,'bizAddressProof')} />
                                        </div>
                                        <div className="upload-box" style={styles.uploadBox} onClick={() => document.getElementById('auth').click()}>
                                            <div style={styles.uploadIcon}>
                                                {previews.authLetter ? <img src={previews.authLetter} alt="Doc" style={styles.previewImg}/> : <FileBadge size={20}/>}
                                            </div>
                                            <div><p style={styles.uploadTitle}>Authority Letter *</p><p style={styles.uploadSub}>{docs.authLetter ? docs.authLetter.name : "Signed by CEO/Director"}</p></div>
                                            <input type="file" id="auth" hidden onChange={(e)=>handleFileChange(e,'authLetter')} />
                                        </div>
                                    </>
                                )}

                                <button style={styles.saveButton} onClick={handleSubmitVerification} disabled={saving}>{saving ? 'Uploading...' : 'Submit Documents'}</button>
                            </div>
                        ) : verificationStatus === 'pending' ? (
                            <div style={styles.pendingBox}>
                                <Loader2 size={32} className="spin-animation" color="#CA8A04"/>
                                <h4>Verification Pending</h4>
                                <p>Your documents are under review. Check back in 24 hours.</p>
                                
                                {/* REPOST / RESET BUTTON */}
                                <button 
                                  onClick={handleResetVerification} 
                                  style={styles.resetButton}
                                  disabled={saving}
                                >
                                  <RefreshCw size={16} /> {saving ? 'Resetting...' : 'Cancel & Re-upload Documents'}
                                </button>
                            </div>
                        ) : (
                            /* THIS BLOCK SHOWS WHEN VERIFIED - HIDING THE PENDING BOX */
                            <div style={{...styles.pendingBox, backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', color: '#166534'}}>
                                <CheckCircle size={48} color="#16A34A" style={{margin: '0 auto 16px'}}/>
                                <h4>Account Verified</h4>
                                <p>Congratulations! Your identity has been confirmed by the Admin.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* === TAB 3: SECURITY === */}
                {activeTab === 'security' && (
                    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{marginBottom:'40px'}}>
                            <h4 style={styles.secHeading}>Change Password</h4>
                            <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                <div>
                                    <label style={styles.label}>Current Password</label>
                                    <input type="password" name="currentPassword" style={styles.input} className="input-field" value={securityData.currentPassword} onChange={handleSecurityChange}/>
                                </div>
                                <div>
                                    <label style={styles.label}>New Password</label>
                                    <input type="password" name="newPassword" style={styles.input} className="input-field" value={securityData.newPassword} onChange={handleSecurityChange}/>
                                </div>
                                <div>
                                    <label style={styles.label}>Confirm New Password</label>
                                    <input type="password" name="confirmPassword" style={styles.input} className="input-field" value={securityData.confirmPassword} onChange={handleSecurityChange}/>
                                </div>
                                <button style={{...styles.saveButton, marginTop:'10px'}} onClick={handleUpdatePassword} disabled={saving}>
                                    {saving ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </div>

                        <div style={styles.divider}></div>

                        <div style={{margin:'30px 0'}}>
                            <h4 style={styles.secHeading}>Active Sessions</h4>
                            <div style={styles.sessionBox}>
                                <Monitor size={20} color="#4B5563"/>
                                <div style={{flex:1}}>
                                    <p style={{margin:0, fontWeight:'600', fontSize:'14px'}}>Windows PC - Chrome</p>
                                    <p style={{margin:0, fontSize:'12px', color:'#16A34A'}}>Active Now • Taxila, PK</p>
                                </div>
                            </div>
                        </div>

                        <div style={styles.divider}></div>

                        <div style={{marginTop: '30px'}}>
                            <h4 style={{...styles.secHeading, color:'#DC2626'}}>Danger Zone</h4>
                            <p style={{fontSize:'13px', color:'#6B7280', marginBottom:'15px'}}>Once you delete your account, there is no going back.</p>
                            <div style={{display:'flex', gap:'15px'}}>
                                <button style={styles.dangerButton} onClick={handleLogout}><LogOut size={16}/> Log Out</button>
                                <button style={styles.dangerButton} onClick={handleDeleteAccount}><Trash2 size={16}/> Delete Account</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageWrapper: { display: 'flex', flexDirection: 'column', width: '100%', minHeight: '100vh', backgroundColor: '#F3F4F6', fontFamily: "'Segoe UI', sans-serif" },
  header: { backgroundColor: 'white', padding: '20px 40px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)', marginBottom: '32px' },
  pageTitle: { fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 },
  pageSubtitle: { fontSize: '13px', color: '#6B7280' },
  verifiedTag: { backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', display:'flex', alignItems:'center', gap:'4px' },
  pendingTag: { backgroundColor: '#FEF9C3', color: '#CA8A04', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' },
  unverifiedTag: { backgroundColor: '#F3F4F6', color: '#6B7280', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' },
  contentArea: { flex: 1, padding: '0 32px 40px 32px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' },
  card: { width: '100%', maxWidth: '750px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow:'hidden' },
  tabHeader: { display: 'flex', borderBottom: '1px solid #E5E7EB', backgroundColor:'#F9FAFB' },
  tabActive: { flex: 1, padding: '16px', fontWeight: '600', color: '#2563EB', borderBottom: '2px solid #2563EB', backgroundColor: 'white', border: 'none', cursor:'pointer', display:'flex', justifyContent:'center' },
  tabInactive: { flex: 1, padding: '16px', fontWeight: '500', color: '#6B7280', backgroundColor: 'transparent', border: 'none', cursor:'pointer', display:'flex', justifyContent:'center' },
  toggleContainer: { backgroundColor: '#F3F4F6', padding: '4px', borderRadius: '10px', display: 'flex', marginBottom: '25px', width: '100%', maxWidth: '400px' },
  toggleActive: { flex: 1, padding: '8px', fontSize: '13px', fontWeight: '600', borderRadius: '8px', backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', color: '#111827', border: 'none', cursor: 'pointer' },
  toggleInactive: { flex: 1, padding: '8px', fontSize: '13px', fontWeight: '500', borderRadius: '8px', backgroundColor: 'transparent', color: '#6B7280', border: 'none', cursor: 'pointer' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' },
  input: { width: '100%', padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: '#F9FAFB', fontSize:'14px', color:'#1F2937', boxSizing:'border-box' },
  gridRow: { display: 'flex', gap: '20px', width: '100%' },
  companyBox: { padding:'20px', backgroundColor:'#F0F9FF', borderRadius:'12px', border:'1px solid #BAE6FD', marginTop:'10px' },
  saveButton: { width: '100%', backgroundColor: '#2563EB', color: 'white', fontWeight: '600', padding: '14px', borderRadius: '10px', border: 'none', cursor: 'pointer', marginTop: '20px' },
  sectionHeader: {fontSize:'14px', fontWeight:'700', color:'#374151', margin:'20px 0 10px 0', borderBottom:'1px solid #E5E7EB', paddingBottom:'5px'},
  uploadBox: { border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor:'#fff', flex:1 },
  uploadIcon: {width:'40px', height:'40px', borderRadius:'8px', backgroundColor:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', color:'#6B7280', overflow: 'hidden'},
  previewImg: {width:'100%', height:'100%', objectFit:'cover'},
  uploadTitle: { margin: 0, fontSize: '13px', fontWeight: '600', color: '#374151' },
  uploadSub: { margin: 0, fontSize: '11px', color: '#9CA3AF' },
  pendingBox: { textAlign: 'center', padding: '40px', backgroundColor: '#FEFCE8', borderRadius: '12px', border: '1px solid #FEF08A', color: '#854D0E' },
  secHeading: { fontSize:'16px', fontWeight:'700', color:'#1F2937', margin:'0 0 15px 0' },
  sessionBox: { display:'flex', alignItems:'center', gap:'15px', padding:'15px', border:'1px solid #E5E7EB', borderRadius:'10px' },
  divider: { height:'1px', backgroundColor:'#E5E7EB', width:'100%' },
  dangerButton: { flex:1, padding: '12px', border: '1px solid #E5E7EB', borderRadius: '8px', backgroundColor: 'white', color: '#DC2626', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  
  // NEW RESET BUTTON STYLE
  resetButton: { marginTop: '20px', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #CA8A04', borderRadius: '8px', color: '#CA8A04', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', margin: '20px auto 0 auto' }
};

export default ProfileSettings;