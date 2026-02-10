import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Clock, Shield, X, CreditCard, Lock, AlertCircle 
} from 'lucide-react'; 

const Billing = () => {
  // --- STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);
  // NEW: Store the list of available plans from DB
  const [availablePlans, setAvailablePlans] = useState([]); 
  const [error, setError] = useState(null);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // ⚠️ SETTINGS: Matches your API Port
  const API_BASE_URL = "https://localhost:7149/api/Billing"; 
  const LOGGED_IN_USER_ID = 2; 

  // --- 1. FETCH DATA ON PAGE LOAD ---
  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch User Details AND Available Plans in parallel
            const [detailsRes, plansRes] = await Promise.all([
                fetch(`${API_BASE_URL}/details?empUserId=${LOGGED_IN_USER_ID}`),
                fetch(`${API_BASE_URL}/plans`)
            ]);

            if (!detailsRes.ok || !plansRes.ok) throw new Error('Failed to fetch data');

            const detailsData = await detailsRes.json();
            const plansData = await plansRes.json();

            setBillingData(detailsData);
            setAvailablePlans(plansData); // Store the list of 3 plans
        } catch (err) {
            console.error(err);
            setError("Could not load billing information.");
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  // --- 2. HANDLE UPGRADE CLICK ---
  const initiateUpgrade = (planId, planName, price) => {
    setSelectedPlan({ id: planId, name: planName, price: price });
    setShowPaymentModal(true);
  };

  // --- 3. HANDLE PAYMENT SUBMIT ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault(); 
    setProcessingPayment(true);

    // Simulate a 2-second bank transaction delay
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/subscribe?empUserId=${LOGGED_IN_USER_ID}&planId=${selectedPlan.id}`, {
                method: 'POST'
            });

            if (response.ok) {
                setProcessingPayment(false);
                setShowPaymentModal(false);
                alert(`Success! You have upgraded to the ${selectedPlan.name}.`);
                window.location.reload(); // Refresh to show new plan
            } else {
                alert("Payment Failed. Please try again.");
                setProcessingPayment(false);
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Connection error.");
            setProcessingPayment(false);
        }
    }, 2000); 
  };

  // Helper: Progress Bar Percentage
  const calculateProgress = (used, limit) => {
    if (limit === -1 || limit === 0) return 100;
    const pct = (used / limit) * 100;
    return pct > 100 ? 100 : pct;
  };

  // Helper: Render Features based on Plan Name
  const renderFeatures = (planItem) => {
      // Determine color based on plan type (Basic/Pro get Blue, Free gets Green)
      const isPaid = planItem.price > 0;
      const color = isPaid ? '#3B82F6' : '#10B981'; 
      
      const postText = planItem.jobPostLimit === -1 ? 'Unlimited Job Posts' : `${planItem.jobPostLimit} Job Posts / Month`;

      return (
        <ul style={styles.featureList}>
            <li style={{...styles.featureItem, color: color}}>
                <CheckCircle size={18} color={color}/> {postText}
            </li>
            
            {/* Logic to show different features for different plans */}
            {planItem.planName === 'Free Plan' && (
                 <li style={{...styles.featureItem, color}}><CheckCircle size={18} color={color}/> Basic Visibility</li>
            )}

            {planItem.planName === 'Basic Plan' && (
                <>
                    <li style={{...styles.featureItem, color}}><CheckCircle size={18} color={color}/> Verified Badge</li>
                    <li style={{...styles.featureItem, color}}><CheckCircle size={18} color={color}/> Email Support</li>
                </>
            )}

            {planItem.planName === 'Pro Plan' && (
                <>
                    <li style={{...styles.featureItem, color}}><CheckCircle size={18} color={color}/> Dedicated Manager</li>
                    <li style={{...styles.featureItem, color}}><CheckCircle size={18} color={color}/> API Access</li>
                </>
            )}
        </ul>
      );
  };

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#6B7280'}}>Loading...</div>;
  if (error) return <div style={{padding:'40px', textAlign:'center', color:'#EF4444'}}><AlertCircle size={40} style={{marginBottom:'10px'}}/><p>{error}</p></div>;

  const { plan: currentPlan, usage, history } = billingData;

  return (
    <div style={styles.pageWrapper}>
      
      {/* --- HEADER --- */}
      <header style={styles.header}>
        <h2 style={styles.pageTitle}>Billing & Subscription</h2>
        <button style={styles.secondaryButton}>Contact Support</button>
      </header>

      <div style={styles.contentArea}>
        
        {/* --- DASHBOARD SECTION --- */}
        <div style={styles.dashboardGrid}>
            <div style={{...styles.dashCard, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'}}>
                <div style={styles.dashLabel}>Job Posts Used</div>
                <div style={styles.dashValue}>
                    {usage.jobsUsedCount} / {currentPlan.jobPostLimit === -1 ? '∞' : currentPlan.jobPostLimit}
                </div>
                <div style={styles.dashIcon}><CheckCircle size={28} color="white" opacity={0.8}/></div>
            </div>
            <div style={{...styles.dashCard, background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'}}>
                <div style={styles.dashLabel}>Current Plan</div>
                <div style={styles.dashValue}>{currentPlan.planName}</div>
                <div style={styles.dashIcon}><Shield size={28} color="white" opacity={0.8}/></div>
            </div>
            <div style={{...styles.dashCard, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'}}>
                <div style={styles.dashLabel}>Plan Renews On</div>
                <div style={styles.dashValue}>
                     {currentPlan.endDate ? new Date(currentPlan.endDate).toLocaleDateString() : 'Never'}
                </div>
                <div style={styles.dashIcon}><Clock size={28} color="white" opacity={0.8}/></div>
            </div>
        </div>

        {/* --- PROGRESS BAR --- */}
        <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>
                    You have used <b>{usage.jobsUsedCount}</b> of your <b>{currentPlan.jobPostLimit === -1 ? 'Unlimited' : currentPlan.jobPostLimit}</b> monthly job posts.
                </span>
            </div>
            <div style={styles.progressBarBg}>
                <div style={{
                    ...styles.progressBarFill, 
                    width: `${calculateProgress(usage.jobsUsedCount, currentPlan.jobPostLimit)}%`,
                    backgroundColor: currentPlan.jobPostLimit === -1 ? '#10B981' : '#3B82F6'
                }}></div>
            </div>
        </div>

        {/* --- DYNAMIC PRICING CARDS --- */}
        <h3 id="plans" style={styles.sectionHeading}>Available Plans</h3>
        <div style={styles.pricingGrid}>
            
            {/* Loop through the plans fetched from DB */}
            {availablePlans.map((planItem) => {
                const isCurrent = currentPlan.planId === planItem.planId;
                // Highlight the middle plan (Basic Plan) or Pro Plan
                const isHighlight = planItem.planName === 'Basic Plan'; 

                const cardStyle = isHighlight ? {...styles.pricingCard, border: '2px solid #3B82F6', transform: 'scale(1.02)'} : styles.pricingCard;
                const btnStyle = isCurrent ? styles.currentPlanBtn : (isHighlight ? styles.upgradeBtn : styles.outlineBtn);

                return (
                    <div key={planItem.planId} style={cardStyle}>
                        {isHighlight && <div style={styles.popularBadge}>POPULAR</div>}
                        
                        <h4 style={styles.pricingTitle}>{planItem.planName}</h4>
                        <p style={styles.pricingPrice}>
                            PKR {Number(planItem.price).toLocaleString()} <span style={styles.priceSub}>/mo</span>
                        </p>
                        
                        {renderFeatures(planItem)}

                        <button 
                            style={btnStyle}
                            disabled={isCurrent}
                            onClick={() => initiateUpgrade(planItem.planId, planItem.planName, planItem.price)}
                        >
                            {isCurrent ? 'Current Plan' : (planItem.price > 0 ? 'Upgrade' : 'Downgrade')}
                        </button>
                    </div>
                );
            })}
        </div>

        {/* --- PAYMENT HISTORY --- */}
        <h3 style={styles.sectionHeading}>Payment History</h3>
        <div style={styles.tableCard}>
            <table style={styles.table}>
                <thead>
                    <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Description</th>
                        <th style={styles.th}>Amount</th>
                        <th style={styles.th}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? (
                        history.map((item, index) => (
                            <tr key={index} style={styles.tr}>
                                <td style={styles.td}>{new Date(item.paymentDate).toLocaleDateString()}</td>
                                <td style={{...styles.td, fontWeight:'500'}}>{item.description}</td>
                                <td style={styles.td}>PKR {Number(item.amount).toLocaleString()}</td>
                                <td style={styles.td}><span style={styles.statusPaid}>{item.status}</span></td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="4" style={{...styles.td, textAlign:'center', color:'#9CA3AF'}}>No payment history found.</td></tr>
                    )}
                </tbody>
            </table>
        </div>

      </div>

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && selectedPlan && (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                    <h3 style={styles.modalTitle}>Secure Checkout</h3>
                    <button onClick={() => !processingPayment && setShowPaymentModal(false)} style={styles.closeBtn} disabled={processingPayment}>
                        <X size={20}/>
                    </button>
                </div>
                <div style={styles.modalBody}>
                    <div style={styles.summaryBox}>
                        <div>
                            <span style={{display:'block', fontSize:'12px', color:'#6B7280'}}>Plan</span>
                            <span style={{fontWeight:'bold', fontSize:'16px'}}>{selectedPlan.name}</span>
                        </div>
                        <div style={{textAlign:'right'}}>
                             <span style={{display:'block', fontSize:'12px', color:'#6B7280'}}>Total</span>
                            <span style={{fontWeight:'bold', fontSize:'18px', color:'#3B82F6'}}>PKR {Number(selectedPlan.price).toLocaleString()}</span>
                        </div>
                    </div>
                    <form onSubmit={handlePaymentSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Name on Card</label>
                            <input type="text" placeholder="e.g. Ali Khan" style={styles.input} required disabled={processingPayment} />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Card Number</label>
                            <div style={styles.inputIconWrapper}>
                                <CreditCard size={18} style={styles.inputIcon} />
                                <input type="text" placeholder="0000 0000 0000 0000" style={{...styles.input, paddingLeft:'40px'}} required disabled={processingPayment} />
                            </div>
                        </div>
                        <div style={{display:'flex', gap:'16px'}}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Expiry</label>
                                <input type="text" placeholder="MM/YY" style={styles.input} required disabled={processingPayment} />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>CVC</label>
                                <input type="text" placeholder="123" style={styles.input} required disabled={processingPayment} />
                            </div>
                        </div>
                        <button type="submit" style={styles.payBtn} disabled={processingPayment}>
                            {processingPayment ? 'Processing Payment...' : `Pay PKR ${Number(selectedPlan.price).toLocaleString()}`}
                            {!processingPayment && <Lock size={16} />}
                        </button>
                    </form>
                    <p style={styles.secureText}><Lock size={14} color="#10B981"/> <span>Secure 256-bit SSL encryption.</span></p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageWrapper: { backgroundColor: '#F9FAFB', minHeight: '100vh', fontFamily: "'Inter', sans-serif", paddingBottom: '60px' },
  header: { backgroundColor: 'white', padding: '20px 40px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { margin: 0, fontSize: '24px', fontWeight: '700', color: '#111827' },
  secondaryButton: { padding: '8px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', color: '#374151', transition: 'all 0.2s' },
  contentArea: { padding: '32px', maxWidth: '1100px', margin: '0 auto' },

  // Dashboard
  dashboardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' },
  dashCard: { padding: '24px', borderRadius: '16px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
  dashLabel: { fontSize: '14px', fontWeight: '500', marginBottom: '8px', opacity: 0.9 },
  dashValue: { fontSize: '28px', fontWeight: '800', lineHeight: 1.2 },
  dashIcon: { position: 'absolute', top: '20px', right: '20px' },
  
  // Progress
  progressSection: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  progressHeader: { marginBottom: '16px', fontSize: '16px', color: '#374151' },
  progressLabel: { display: 'block', textAlign: 'center' },
  progressBarBg: { height: '12px', backgroundColor: '#F3F4F6', borderRadius: '7px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '7px', transition: 'width 0.5s ease-in-out' },
  
  // Pricing Grid (3 Cards in One Row)
  sectionHeading: { fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#111827' },
  pricingGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px', alignItems: 'start' },
  pricingCard: { backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #E5E7EB', position: 'relative', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s' },
  popularBadge: { position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#3B82F6', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' },
  pricingTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#111827' },
  pricingPrice: { fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '20px', display:'flex', alignItems:'baseline', gap:'4px' },
  priceSub: { fontSize: '14px', fontWeight: '500', color: '#6B7280' },
  featureList: { listStyle: 'none', padding: 0, marginBottom: '24px', flexGrow: 1 },
  featureItem: { display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '14px', alignItems: 'center' },
  upgradeBtn: { width: '100%', padding: '12px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize:'14px', cursor: 'pointer', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#2563EB' } },
  currentPlanBtn: { width: '100%', padding: '12px', backgroundColor: '#F3F4F6', color: '#9CA3AF', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize:'14px', cursor: 'not-allowed' },
  outlineBtn: { width: '100%', padding: '12px', backgroundColor: 'white', border: '2px solid #E5E7EB', borderRadius: '10px', fontWeight: '700', fontSize:'14px', color: '#374151', cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' } },

  // Table
  tableCard: { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeaderRow: { backgroundColor: '#F9FAFB' },
  th: { padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '16px', borderTop: '1px solid #F3F4F6', fontSize: '14px', color: '#111827' },
  statusPaid: { backgroundColor: '#ECFDF5', color: '#047857', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },

  // Modal
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' },
  modalContent: { backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  modalHeader: { padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { margin: 0, fontSize: '20px', fontWeight: '700' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding:'4px', borderRadius:'50%', transition:'background-color 0.2s', ':hover':{backgroundColor:'#F3F4F6'} },
  modalBody: { padding: '24px' },
  summaryBox: { display: 'flex', justifyContent: 'space-between', backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px', marginBottom: '24px' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#374151' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', transition:'border-color 0.2s', ':focus':{borderColor:'#3B82F6', outline:'none'} },
  inputIconWrapper: { position: 'relative' },
  inputIcon: { position: 'absolute', left: '12px', top: '12px', color: '#9CA3AF' },
  payBtn: { width: '100%', padding: '12px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize:'15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems:'center', gap:'10px', marginTop:'16px', transition:'background-color 0.2s', ':hover':{backgroundColor:'#2563EB'}, ':disabled':{backgroundColor:'#93C5FD', cursor:'not-allowed'} },
  secureText: { display: 'flex', justifyContent: 'center', alignItems:'center', gap:'8px', fontSize: '12px', color: '#6B7280', marginTop: '20px' }
};

export default Billing;