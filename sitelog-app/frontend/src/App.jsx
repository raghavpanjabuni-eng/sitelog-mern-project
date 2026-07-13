import React, { useState, useEffect } from 'react';
import axios from 'axios';

// LEAVE THIS FOR NOW - We will update this string with your live backend URL later
const API_URL = 'https://sitelog-backend.onrender.com/api/logs';

function App() {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialCost, setMaterialCost] = useState('');

  useEffect(() => {
    if(!API_URL.includes("YOUR-BACKEND-URL-HERE")) fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(API_URL);
      setLogs(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return alert('Fill required fields');
    try {
      await axios.post(API_URL, { title, description, materialCost: Number(materialCost) || 0 });
      setTitle(''); setDescription(''); setMaterialCost('');
      fetchLogs();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2>👷 Construction Site Log Manager</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <input type="text" placeholder="Task Name (e.g., Manual Excavation)" value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '10px' }} required />
        <textarea placeholder="Details (Material details, labor updates)" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '10px' }} required />
        <input type="number" placeholder="Material Cost (₹)" value={materialCost} onChange={e => setMaterialCost(e.target.value)} style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '12px', background: '#0070f3', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>Save Log Entry</button>
      </form>
      <div style={{ marginTop: '30px' }}>
        <h3>Activity Records</h3>
        {logs.map(log => (
          <div key={log._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
            <h4>{log.title}</h4>
            <p>{log.description}</p>
            <p><strong>Cost:</strong> ₹{log.materialCost}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default App;
