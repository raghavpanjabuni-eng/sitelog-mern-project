import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://sitelog-backend.onrender.com/api';

function App() {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [category, setCategory] = useState('Excavation');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => { if (token) fetchLogs(); }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/logs`, { headers: { Authorization: `Bearer ${token}` } });
      setLogs(res.data);
    } catch (err) { if(err.response?.status === 401) handleLogout(); }
  };

  const handleAuth = async (e) => {
    e.preventDefault(); setAuthError('');
    const endpoint = isLoginView ? 'login' : 'signup';
    try {
      const res = await axios.post(`${API_URL}/auth/${endpoint}`, { username: authUsername, password: authPassword });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      setToken(res.data.token); setUsername(res.data.username);
      setAuthUsername(''); setAuthPassword('');
    } catch (err) { setAuthError(err.response?.data?.error || 'Authentication failed.'); }
  };

  const handleLogout = () => {
    localStorage.clear(); setToken(''); setUsername(''); setLogs([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert('Please fill in required fields');
    try {
      await axios.post(`${API_URL}/logs`, 
        { title, category, description, materialCost: Number(materialCost) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle(''); setDescription(''); setMaterialCost('');
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Wipe this record out?")) return;
    try {
      await axios.delete(`${API_URL}/logs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const totalExpense = logs.reduce((sum, log) => sum + log.materialCost, 0);
  const highCostTasks = logs.filter(log => log.materialCost > 10000).length;
  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.category && log.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>🏗️</span>
            <h2 style={{ margin: '10px 0 4px 0', color: '#0f172a', fontWeight: '800' }}>SiteLog Enterprise</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Infrastructure Management Hub</p>
          </div>
          {authError && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fee2e2' }}>⚠️ {authError}</div>}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} required />
            <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px' }} required />
            <button type="submit" style={{ padding: '14px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '16px', fontWeight: '700' }}>
              {isLoginView ? 'Authenticate Session' : 'Register Manager Account'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            {isLoginView ? "Need access? " : "Authorized? "}
            <span onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>
              {isLoginView ? 'Create Account' : 'Return to Login'}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <nav style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: '800', fontSize: '19px' }}>📊 SiteLog <span style={{ color: '#3b82f6', fontSize: '12px', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '12px' }}>v2.4 PRO</span></span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Session: <strong style={{ color: '#3b82f6' }}>{username}</strong></span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '6px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Gross Expenditure</span>
            <h2 style={{ fontSize: '26px', margin: '6px 0 0 0', fontWeight: '800' }}>₹{totalExpense}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '6px solid #eab308', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>Total Daily Logs</span>
            <h2 style={{ fontSize: '26px', margin: '6px 0 0 0', fontWeight: '800' }}>{logs.length}</h2>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', borderLeft: '6px solid #ef4444', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>High-Cost Operations (&gt;10k)</span>
            <h2 style={{ fontSize: '26px', margin: '6px 0 0 0', fontWeight: '800' }}>{highCostTasks}</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '14px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>🛠️ Metrics Logger</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Task Name (e.g., Manual Excavation)" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', fontSize: '14px' }}>
                  <option value="Excavation">Excavation</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Material Purchase">Material Buy</option>
                  <option value="Labor Allocation">Labor Team</option>
                </select>
                <input type="number" placeholder="Cost (₹)" value={materialCost} onChange={e => setMaterialCost(e.target.value)} style={{ padding: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              <textarea placeholder="Specify operational metrics..." value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '90px', fontFamily: 'inherit' }} required />
              <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Commit Record</button>
            </form>
          </div>

          <div>
            <div style={{ backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <span>🔍</span>
              <input type="text" placeholder="Search logs instantly..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ border: 'none', width: '100%', outline: 'none', fontSize: '14px' }} />
            </div>

            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#475569' }}>Data Feeds ({filteredLogs.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredLogs.map(log => (
                <div key={log._id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', borderTop: '4px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700' }}>{log.title}</h4>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>📅 {new Date(log.date).toLocaleDateString()}</span>
                        <span style={{ fontSize: '11px', color: '#1e40af', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', border: '1px solid #bfdbfe' }}>🏷️ {log.category || 'Excavation'}</span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: log.materialCost > 10000 ? '#fef2f2' : '#f0fdf4', color: log.materialCost > 10000 ? '#ef4444' : '#16a34a', fontSize: '14px', fontWeight: '800', padding: '4px 10px', borderRadius: '6px' }}>₹{log.materialCost}</span>
                  </div>
                  <div style={{ margin: '12px 0', borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
                    <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80" alt="Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '14px', lineHeight: '1.5', backgroundColor: '#fafafa', padding: '10px', borderRadius: '6px' }}>{log.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <button onClick={() => handleDelete(log._id)} style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>Wipe Entry</button>
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
