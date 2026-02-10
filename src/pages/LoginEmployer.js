import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginEmployer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. USE HTTPS PORT (7149)
      const response = await fetch("https://localhost:7149/api/EmployerAuth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // 2. SAVE THE 'TICKET' (UserId) FOR THE SECURITY GUARD
        localStorage.setItem("userId", data.userId); 
        localStorage.setItem("token", data.token); 
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.name);
        
        alert("Login Successful!");
        
        // 3. REDIRECT TO DASHBOARD
        navigate('/dashboard'); 
      } else {
        alert("Login Failed: " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Network Error: Is the backend running on https://localhost:7149?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Recruiter Login</h2>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input 
              name="email" 
              type="email" 
              onChange={handleChange} 
              style={styles.input}
              placeholder="name@company.com"
              required 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input 
              name="password" 
              type="password" 
              onChange={handleChange} 
              style={styles.input}
              placeholder="••••••••"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={styles.link}
          >
            Register here
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
    backgroundColor: '#f3f4f6', // Light Gray background
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#1e3a8a', // Dark Blue
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    color: '#4b5563', // Gray-600
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    backgroundColor: '#2563eb', // Brand Blue
    color: 'white',
    fontWeight: '700',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
    transition: 'background-color 0.2s',
  },
  footerText: {
    marginTop: '2rem',
    textAlign: 'center',
    fontSize: '0.95rem',
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
  }
};

export default LoginEmployer;