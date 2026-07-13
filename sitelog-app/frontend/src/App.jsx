import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Update this to match your exact live Render backend URL
const API_URL = 'https://sitelog-backend.onrender.com/api';

function App() {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  
  // Auth States
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      fetchLogs();
    }
  }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(res.data);
    } catch (err) {
      if(err.response?.status === 401) handleLogout();
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = isLoginView ? 'login' : 'signup';
    try {
      const res = await axios.post(`${API_URL}/auth/${endpoint}`, { username: authUsername, password: authPassword });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setToken(res.data.token);
      setUsername(res.data.username);
      setAuthUsername('');
      setAuthPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Authentication failed.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setUsername('');
    setLogs([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert('Fill required fields');
    try {
      await axios.post(`${API_URL}/logs`, 
        { title, description, materialCost: Number(materialCost) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle(''); setDescription(''); setMaterialCost('');
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const totalExpense = logs.reduce((sum, log) => sum + log.materialCost, 0);

  // AUTHENTICATION VIEW (LOGIN / SIGNUP CARD)
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 8px 0', color: '#0f172a' }}>👷 SiteLog System</h2>
          <p style={{ textAlign: 'center', color: '#64748b', margin: '0 0 24px 0', fontSize: '14px' }}>
            {isLoginView ? 'Sign in to manage your site records' : 'Create a manager account'}
          </p>
          
          {authError && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '10px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fee2e2' }}>{authError}</div>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} required />
            <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} required />
            <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '16px', fontWeight: '600' }}>
              {isLoginView ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#475569' }}>
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}>
              {isLoginView ? 'Sign Up' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // CORE APPLICATION DASHBOARD VIEW
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>👷 SiteLog Dashboard</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Manager Workspace: <strong>{username}</strong> | <span onClick={handleLogout} style={{ color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}>Logout</span></p>
          </div>
          <div style={{ textAlign: 'right', backgroundColor: '#eff6ff', padding: '10px 20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e40af', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>TOTAL EXPENDITURE</span>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1d4ed8' }}>₹{totalExpense}</span>
          </div>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#334155' }}>Log Daily Progress</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Task Name (e.g., Manual Excavation)" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} required />
              <textarea placeholder="Details (Material logistics, labor updates, etc.)" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', minHeight: '80px', fontFamily: 'inherit' }} required />
              <input type="number" placeholder="Material Cost (₹)" value={materialCost} onChange={e => setMaterialCost(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px' }} />
              <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '16px', fontWeight: '600' }}>Save Log Entry</button>
            </form>
          </div>

          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#334155' }}>Activity Records ({logs.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>No logged entries found for this account. Create one above!</div>
              ) : null}
              {logs.map(log => (
                <div key={log._id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #2563eb', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{log.title}</h4>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ margin: '14px 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#e2e8f0' }}>
                    <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80" alt="Site Visual" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '15px', lineHeight: '1.5' }}>{log.description}</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Material Cost: <strong style={{ color: '#0f172a' }}>₹{log.materialCost}</strong></span>
                    <button onClick={() => handleDelete(log._id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Delete Record</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
