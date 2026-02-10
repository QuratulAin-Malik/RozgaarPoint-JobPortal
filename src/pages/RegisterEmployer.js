import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterEmployer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 1. State to hold all registration data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
    employerType: 'Individual', // Default selection
    organizationName: '',
    organizationAddress: ''
  });

  // 2. Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Submit Form to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("https://localhost:7149/api/EmployerAuth/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           // Mapping React state to Backend Model properly
           FullName: formData.fullName,
           Email: formData.email,
           PasswordHash: formData.password, // Mapping password to PasswordHash as per your backend
           PhoneNumber: formData.phone,
           CNIC: formData.cnic,
           EmployerType: formData.employerType,
           OrganizationName: formData.employerType === 'Organization' ? formData.organizationName : null,
           OrganizationAddress: formData.employerType === 'Organization' ? formData.organizationAddress : null
        }),
      });

      if (response.ok) {
        alert("Registration Successful! Please Login.");
        navigate('/login'); 
      } else {
        const errorData = await response.text();
        console.log("Server Error:", errorData);
        alert("Registration Failed: " + errorData);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network Error: Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Recruiter Registration</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Full Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input 
              name="fullName" 
              type="text" 
              value={formData.fullName} // Correctly binds to state
              onChange={handleChange} 
              style={styles.input}
              placeholder="e.g. Ali Khan" 
              required 
            />
          </div>

          {/* Email */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              name="email" 
              type="email" 
              value={formData.email} // Correctly binds to state
              onChange={handleChange} 
              style={styles.input}
              placeholder="name@example.com" 
              required 
            />
          </div>

          {/* Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              name="password" 
              type="password" 
              value={formData.password} // Correctly binds to state
              onChange={handleChange} 
              style={styles.input}
              placeholder="Create a password"
              required 
            />
          </div>

          {/* Phone */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input 
              name="phone" 
              type="text" 
              value={formData.phone}
              onChange={handleChange} 
              style={styles.input}
              placeholder="0300-1234567" 
              required 
            />
          </div>

          {/* CNIC */}
          <div style={styles.formGroup}>
            <label style={styles.label}>CNIC (Optional)</label>
            <input 
              name="cnic" 
              type="text" 
              value={formData.cnic}
              onChange={handleChange} 
              style={styles.input}
              placeholder="35202-1234567-1" 
            />
          </div>

          {/* --- EMPLOYER TYPE SELECTION --- */}
          <div style={styles.typeContainer}>
            <label style={styles.typeLabel}>I am hiring as:</label>
            <select
              name="employerType"
              value={formData.employerType}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="Individual">Individual (Personal/Home Needs)</option>
              <option value="Organization">Organization (Company/Business)</option>
            </select>
          </div>

          {/* --- CONDITIONAL FIELDS: ORGANIZATION --- */}
          {formData.employerType === 'Organization' && (
            <div style={styles.orgContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Organization Name</label>
                <input 
                  name="organizationName" 
                  type="text" 
                  value={formData.organizationName}
                  onChange={handleChange} 
                  style={styles.input}
                  placeholder="e.g. Tech Solutions" 
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Office Address</label>
                <input 
                  name="organizationAddress" 
                  type="text" 
                  value={formData.organizationAddress}
                  onChange={handleChange} 
                  style={styles.input}
                  placeholder="e.g. Office 101, Blue Area" 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#4b5563' }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}
          >
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
};

// --- INLINE STYLES ---
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6', 
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '450px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    textAlign: 'center',
    color: '#1d4ed8', 
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    color: '#374151', 
    fontWeight: '600',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db', 
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  typeContainer: {
    padding: '1rem',
    backgroundColor: '#eff6ff', 
    borderRadius: '8px',
    border: '1px solid #bfdbfe', 
    marginTop: '0.5rem',
  },
  typeLabel: {
    display: 'block',
    color: '#1e40af', 
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  select: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  orgContainer: {
    paddingLeft: '1rem',
    borderLeft: '4px solid #3b82f6', 
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb', 
    color: 'white',
    fontWeight: 'bold',
    padding: '0.85rem',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'background-color 0.3s',
  },
};

export default RegisterEmployer;