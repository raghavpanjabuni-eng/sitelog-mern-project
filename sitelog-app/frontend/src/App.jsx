import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Update this to match your exact live Render backend URL
const API_URL = 'https://sitelog-backend.onrender.com/api';

function App() {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [category, setCategory] = useState('Excavation');
  const [searchTerm, setSearchTerm] = useState('');
  
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
      setAuthError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
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
    if (!title || !description) return alert('Please fill in required fields');
    try {
      // We append the category into the description or structure for presentation purposes
      const enrichedDescription = `[Category: ${category}] ${description}`;
      await axios.post(`${API_URL}/logs`, 
        { title, description: enrichedDescription, materialCost: Number(materialCost) || 0 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle(''); setDescription(''); setMaterialCost('');
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this resource record?")) return;
    try {
      await axios.delete(`${API_URL}/logs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  // Complex Internship Calculations (Metrics Aggregations)
  const totalExpense = logs.reduce((sum, log) => sum + log.materialCost, 0);
  const highCostTasks = logs.filter(log => log.materialCost > 10000).length;
  
  // Filtered logs array based on interactive search bar
  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // AUTHENTICATION SCREEN (MODERNIZED UI WITH ACCENT GRADIENTS)
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '420px', transition: 'all 0.3s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '40px' }}>🏗️</span>
            <h2 style={{ margin: '10px 0 4px 0', color: '#0f172a', fontWeight: '800', letterSpacing: '-0.5px' }}>SiteLog Enterprise</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Industrial Infrastructure Management Hub</p>
          </div>
          
          {authError && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', border: '1px solid #fee2e2', fontWeight: '500' }}>⚠️ {authError}</div>}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Manager Username</label>
              <input type="text" placeholder="e.g., admin_raghav" value={authUsername} onChange={e => setAuthUsername(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Security Password</label>
              <input type="password" placeholder="••••••••" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} required />
            </div>
            <button type="submit" style={{ padding: '14px', background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '16px', fontWeight: '700', boxShadow: '0 4px 12px rgba(37,99,235,0.2)', marginTop: '6px' }}>
              {isLoginView ? 'Authenticate Session' : 'Register New Manager Account'}
            </button>
          </form>
          
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '26px', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {isLoginView ? "New station deployment? " : "Authorized entity? "}
              <span onClick={() => { setIsLoginView(!isLoginView); setAuthError(''); }} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '700', textDecoration: 'underline' }}>
                {isLoginView ? 'Request Access' : 'Return to Portal'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // INTERNSHIP GRADED PRODUCTION DASHBOARD VIEW
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      
      {/* Top Professional Navigation Bar */}
      <nav style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>📊</span>
          <span style={{ fontWeight: '800', fontSize: '19px', letterSpacing: '-0.5px' }}>SiteLog <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', marginLeft: '6px', backgroundColor: '#1e293b', padding: '3px 8px', borderRadius: '12px' }}>v2.4 PRO</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8' }}>Active Session: <strong style={{ color: '#3b82f6' }}>{username}</strong></span>
          <button onClick={handleLogout} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}>Terminate Session</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* ROW 1: ANALYTICS INTELLIGENCE METRIC CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '35px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '6px solid #2563eb' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gross Material Expenditure</span>
            <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: '800', color: '#1e293b' }}>₹{totalExpense}</h2>
            <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '6px', fontWeight: '600' }}>● Live Budget Connected</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '6px solid #eab308' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Logs Recorded</span>
            <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: '800', color: '#1e293b' }}>{logs.length}</h2>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Entries mapped in cluster</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderLeft: '6px solid #ef4444' }}>
            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>High-Cost Operations (&gt;₹10k)</span>
            <h2 style={{ fontSize: '28px', margin: '8px 0 0 0', fontWeight: '800', color: '#1e293b' }}>{highCostTasks}</h2>
            <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px', fontWeight: '600' }}>Requires administrative review</div>
          </div>
        </div>

        {/* ROW 2: CONTROL PANEL GRID LAYOUT */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
          
          {/* DATA INPUT CONTROL CARD */}
          <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>🛠️ Log Site Metrics</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Operation / Task Name</label>
                <input type="text" placeholder="e.g., Manual Excavation Foundation" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} required />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Operational Group</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', fontSize: '14px' }}>
                    <option value="Excavation">Excavation</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Material Purchase">Material Buy</option>
                    <option value="Labor Allocation">Labor Team</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Invoice Cost (₹)</label>
                  <input type="number" placeholder="Cost in ₹" value={materialCost} onChange={e => setMaterialCost(e.target.value)} style={{ width: '100%', padding: '11px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Comprehensive Specifications</label>
                <textarea placeholder="Specify material metrics, transport quantities, or workforce shifts..." value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', minHeight: '90px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} required />
              </div>

              <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '15px', fontWeight: '700', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Commit Data Stream</button>
            </form>
          </div>

          {/* REAL-TIME DATA LOG FEED */}
          <div>
            {/* Search and Filter Utilities */}
            <div style={{ backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#64748b' }}>🔍</span>
              <input type="text" placeholder="Filter through engine logs instantly..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ border: 'none', width: '100%', outline: 'none', fontSize: '14px', color: '#1e293b' }} />
            </div>

            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#475569' }}>Synchronized Data Registers ({filteredLogs.length})</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', backgroundColor: '#ffffff', borderRadius: '12px', border: '2px dashed #e2e8f0', fontSize: '14px' }}>No validated records found matching parameters.</div>
              ) : null}
              
              {filteredLogs.map(log => (
                <div key={log._id} style={{ backgroundColor: '#ffffff', padding: '22px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', borderTop: '4px solid #2563eb', transition: 'transform 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700', color: '#0f172a' }}>{log.title}</h4>
                      <span style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: '600' }}>
                        📅 System Node: {new Date(log.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span style={{ backgroundColor: log.materialCost > 10000 ? '#fef2f2' : '#f0fdf4', color: log.materialCost > 10000 ? '#ef4444' : '#16a34a', fontSize: '14px', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', border: '1px solid' }}>
                      ₹{log.materialCost}
                    </span>
                  </div>
                  
                  {/* Dynamic Visual Media Core */}
                  <div style={{ margin: '14px 0', borderRadius: '8px', overflow: 'hidden', height: '150px', backgroundColor: '#e2e8f0' }}>
                    <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80" alt="Operational Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <p style={{ margin: '0 0 16px 0', color: '#475569', fontSize: '14px', lineHeight: '1.6', backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px', border: '1px solid #f0f0f0' }}>{log.description}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <button onClick={() => handleDelete(log._id)} style={{ background: 'none', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px' }}>Wipe Record</button>
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
