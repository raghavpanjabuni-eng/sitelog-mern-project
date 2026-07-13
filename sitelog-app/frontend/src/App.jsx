import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure this matches your exact live Render backend URL
const API_URL = 'https://sitelog-backend.onrender.com/api/logs';

function App() {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialCost, setMaterialCost] = useState('');

  useEffect(() => {
    if (!API_URL.includes("YOUR-BACKEND-URL-HERE")) {
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(API_URL);
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert('Please fill in required fields');
    try {
      await axios.post(API_URL, { title, description, materialCost: Number(materialCost) || 0 });
      setTitle('');
      setDescription('');
      setMaterialCost('');
      fetchLogs();
    } catch (err) {
      console.error('Error creating log:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchLogs();
    } catch (err) {
      console.error('Error deleting log:', err);
    }
  };

  const totalExpense = logs.reduce((sum, log) => sum + log.materialCost, 0);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Dashboard section */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '20px 30px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>👷 SiteLog Dashboard</h1>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>Construction Daily Management System</p>
          </div>
          <div style={{ textAlign: 'right', backgroundColor: '#eff6ff', padding: '10px 20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#1e40af', fontWeight: '600', display: 'block', letterSpacing: '0.5px' }}>TOTAL EXPENDITURE</span>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1d4ed8' }}>₹{totalExpense}</span>
          </div>
        </header>

        {/* Layout Layout Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Form Card */}
          <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#334155' }}>Log Daily Progress</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Task Name (e.g., Manual Excavation)" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', outline: 'none' }} required />
              <textarea placeholder="Details (Material logistics, labor updates, etc.)" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', minHeight: '80px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' }} required />
              <input type="number" placeholder="Material Cost (₹)" value={materialCost} onChange={e => setMaterialCost(e.target.value)} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '15px', outline: 'none' }} />
              <button type="submit" style={{ padding: '12px', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '16px', fontWeight: '600' }}>Save Log Entry</button>
            </form>
          </div>

          {/* Feed Records Area */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#334155' }}>Activity Records ({logs.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>No records found yet.</div>
              ) : null}
              {logs.map(log => (
                <div key={log._id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '5px solid #2563eb', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>{log.title}</h4>
                    <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 8px', borderRadius: '4px' }}>
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {/* Dynamic Visual Image Card Integration */}
                  <div style={{ margin: '14px 0', borderRadius: '8px', overflow: 'hidden', height: '160px', backgroundColor: '#e2e8f0' }}>
                    <img 
                      src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80" 
                      alt="Construction Site Layout" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>

                  <p style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '15px', lineHeight: '1.5' }}>{log.description}</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                      Material Cost: <strong style={{ color: '#0f172a' }}>₹{log.materialCost}</strong>
                    </span>
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
