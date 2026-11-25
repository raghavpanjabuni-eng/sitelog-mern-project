
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://sitelog-backend.onrender.com/api';

const categories = [
  'Excavation',
  'Logistics',
  'Material Purchase',
  'Labor Allocation'
];

const icons = {
  Excavation: '🚜',
  Logistics: '🚚',
  'Material Purchase': '🧱',
  'Labor Allocation': '👷'
};

const colors = ['#2563eb', '#0891b2', '#d97706', '#16a34a'];

const money = (value) =>
  '₹' + (Number(value) || 0).toLocaleString('en-IN');

function App() {
  const [logs, setLogs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialCost, setMaterialCost] = useState('');
  const [category, setCategory] = useState('Excavation');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  const isAdmin = username.toLowerCase() === 'raghav';

  const headers = {
    Authorization: `Bearer ${token}`
  };

  useEffect(() => {
    if (token) fetchLogs();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken('');
    setUsername('');
    setLogs([]);
    setMessage('');
    setLoadError('');
    setTitle('');
    setDescription('');
    setMaterialCost('');
    setSearchTerm('');
    setFilter('All');
  };

  const fetchLogs = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const res = await axios.get(`${API_URL}/logs`, { headers });
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      } else {
        setLoadError('Unable to load records. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanUsername = authUsername.trim();

    if (cleanUsername.length < 4 || cleanUsername.length > 15) {
      return setAuthError('Username must contain 4–15 characters.');
    }

    if (authPassword.length < 6 || authPassword.length > 20) {
      return setAuthError('Password must contain 6–20 characters.');
    }

    setAuthLoading(true);

    try {
      const endpoint = isLoginView ? 'login' : 'signup';

      const res = await axios.post(`${API_URL}/auth/${endpoint}`, {
        username: cleanUsername,
        password: authPassword
      });

      if (!res.data.token) {
        setIsLoginView(true);
        setAuthPassword('');
        setAuthError('Please sign in to continue.');
        return;
      }

      const activeUser = res.data.username || cleanUsername;

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', activeUser);

      setToken(res.data.token);
      setUsername(activeUser);
      setAuthUsername('');
      setAuthPassword('');
      setShowPassword(false);

    } catch (err) {
      setAuthError(
        err.response?.data?.error ||
        'Unable to connect. Please try again.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!title.trim() || !description.trim()) {
      return setMessage('Please complete all required fields.');
    }

    setSaving(true);

    try {
      await axios.post(
        `${API_URL}/logs`,
        {
          title: title.trim(),
          category,
          description: description.trim(),
          materialCost: Number(materialCost) || 0
        },
        { headers }
      );

      setTitle('');
      setDescription('');
      setMaterialCost('');
      setMessage('Record saved successfully.');
      await fetchLogs();

    } catch (err) {
      setMessage('Unable to save the record. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;

    if (!window.confirm('Permanently delete this site record?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/logs/${id}`, { headers });
      setMessage('Record deleted successfully.');
      await fetchLogs();
    } catch (err) {
      setMessage('Unable to delete the record.');
    }
  };

  const totalExpense = logs.reduce(
    (sum, log) => sum + (Number(log.materialCost) || 0),
    0
  );

  const highCostTasks = logs.filter(
    log => Number(log.materialCost) > 10000
  ).length;

  const categoryTotals = categories.map((name, index) => ({
    name,
    color: colors[index],
    amount: logs
      .filter(log => log.category === name)
      .reduce((sum, log) => sum + (Number(log.materialCost) || 0), 0)
  }));

  const filteredLogs = logs.filter(log => {
    const query = searchTerm.toLowerCase();

    const matchesSearch = [
      log.title,
      log.description,
      log.category
    ].some(value =>
      String(value || '').toLowerCase().includes(query)
    );

    return matchesSearch &&
      (filter === 'All' || log.category === filter);
  });

  const styles = `
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: Inter, 'Segoe UI', system-ui, sans-serif;
      background: #f1f5f9;
      color: #0f172a;
    }

    #root {
      width: 100%;
      min-height: 100vh;
      max-width: none;
      padding: 0;
      text-align: left;
    }

    button, input, select, textarea {
      font: inherit;
    }

    button {
      cursor: pointer;
      transition: background .2s, opacity .2s;
    }

    button:disabled {
      cursor: wait;
      opacity: .65;
    }

    input, select, textarea {
      width: 100%;
      min-width: 0;
      padding: 13px;
      background: white;
      color: #0f172a;
      border: 1px solid #cbd5e1;
      border-radius: 9px;
      font-size: 15px;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px #dbeafe;
    }

    textarea {
      min-height: 110px;
      resize: vertical;
    }

    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 7px;
      color: #475569;
    }

    .primary {
      width: 100%;
      border: none;
      border-radius: 9px;
      background: #2563eb;
      color: white;
      padding: 13px;
      font-weight: 700;
    }

    .primary:hover {
      background: #1d4ed8;
    }

    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 22px;
      background: linear-gradient(145deg,#0f172a,#1e3a8a);
    }

    .auth-card {
      width: 100%;
      max-width: 430px;
      padding: 35px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 24px 70px #0004;
    }

    .brand-icon {
      width: 52px;
      height: 52px;
      display: grid;
      place-items: center;
      background: #dbeafe;
      border-radius: 13px;
      font-size: 28px;
      flex-shrink: 0;
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 28px;
    }

    .auth-brand .brand-icon {
      margin: 0 auto 15px;
    }

    .auth-brand h1 {
      font-size: 26px;
      margin: 0 0 7px;
      letter-spacing: -1px;
    }

    .muted {
      color: #64748b;
      font-size: 14px;
    }

    .form-stack {
      display: flex;
      flex-direction: column;
      gap: 17px;
    }

    .password-wrap {
      position: relative;
    }

    .password-wrap input {
      padding-right: 65px;
    }

    .password-toggle {
      position: absolute;
      right: 8px;
      top: 8px;
      border: 0;
      background: #f1f5f9;
      color: #475569;
      border-radius: 6px;
      padding: 6px;
      font-size: 12px;
    }

    .text-button {
      border: none;
      background: transparent;
      color: #2563eb;
      font-weight: 700;
    }

    .error {
      background: #fef2f2;
      color: #b91c1c;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 15px;
    }

    .notice {
      background: #eff6ff;
      color: #1e40af;
      padding: 12px;
      border-radius: 8px;
      font-size: 13px;
    }

    .navbar {
      background: #0f172a;
      color: white;
      padding: 16px 5%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15px;
      flex-wrap: wrap;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 20px;
      letter-spacing: -.5px;
    }

    .nav-brand small {
      color: #94a3b8;
      font-size: 12px;
    }

    .nav-user {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }

    .role {
      padding: 4px 9px;
      color: #93c5fd;
      background: #1e3a5f;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
    }

    .logout {
      color: white;
      background: #334155;
      border: 1px solid #475569;
      border-radius: 8px;
      padding: 9px 15px;
    }

    .container {
      max-width: 1250px;
      margin: auto;
      padding: 30px 22px;
    }

    .page-heading {
      margin-bottom: 25px;
    }

    .page-heading h1 {
      font-size: 29px;
      margin: 0 0 7px;
      letter-spacing: -.8px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 18px;
      margin-bottom: 23px;
    }

    .stat {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 15px;
      padding: 22px;
      box-shadow: 0 3px 10px #0f172a05;
    }

    .stat-icon {
      font-size: 23px;
      margin-bottom: 12px;
    }

    .stat-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: clamp(21px,3vw,30px);
      font-weight: 800;
      margin: 8px 0 0;
      overflow-wrap: anywhere;
    }

    .panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 15px;
      padding: 24px;
      box-shadow: 0 3px 10px #0f172a05;
      min-width: 0;
    }

    .panel h2 {
      font-size: 18px;
      margin: 0 0 8px;
      letter-spacing: -.3px;
    }

    .analytics {
      margin-bottom: 24px;
    }

    .chart-row {
      margin-top: 18px;
    }

    .chart-label {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
      margin-bottom: 7px;
    }

    .chart-track {
      background: #f1f5f9;
      height: 10px;
      border-radius: 20px;
      overflow: hidden;
    }

    .chart-fill {
      height: 100%;
      border-radius: 20px;
      transition: width .4s;
    }

    .workspace-grid {
      display: grid;
      grid-template-columns: minmax(0,1fr) minmax(0,1.4fr);
      gap: 24px;
      align-items: start;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 12px;
    }

    .filters {
      display: grid;
      grid-template-columns: minmax(0,1fr) minmax(0,.65fr);
      gap: 10px;
      margin: 18px 0;
    }

    .activity-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 14px;
    }

    .activity-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      flex-wrap: wrap;
    }

    .activity-title {
      display: flex;
      align-items: center;
      gap: 11px;
      min-width: 0;
      flex: 1;
    }

    .activity-icon {
      flex-shrink: 0;
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      background: #eff6ff;
      border-radius: 10px;
      font-size: 22px;
    }

    .activity-title h3 {
      margin: 0 0 5px;
      font-size: 15px;
      overflow-wrap: anywhere;
    }

    .cost {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      white-space: nowrap;
    }

    .activity-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 13px;
      font-size: 11px;
      color: #64748b;
    }

    .category-tag {
      background: #eff6ff;
      color: #1d4ed8;
      border-radius: 5px;
      padding: 4px 8px;
      font-weight: 600;
    }

    .activity-description {
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
      margin: 13px 0 0;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .delete {
      border: 1px solid #fecaca;
      border-radius: 7px;
      background: #fef2f2;
      color: #b91c1c;
      padding: 7px 11px;
      font-size: 12px;
      margin-top: 14px;
    }

    .empty {
      text-align: center;
      color: #64748b;
      padding: 35px 12px;
      font-size: 14px;
    }

    .footer {
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      padding: 30px 10px;
    }

    @media(max-width: 850px) {
      .workspace-grid {
        grid-template-columns: minmax(0,1fr);
      }
    }

    @media(max-width: 600px) {
      .container {
        padding: 22px 14px;
      }

      .navbar {
        padding: 15px;
      }

      .nav-brand h2 {
        font-size: 18px;
      }

      .nav-user {
        width: 100%;
        justify-content: space-between;
      }

      .stats-grid {
        grid-template-columns: repeat(2,minmax(0,1fr));
        gap: 12px;
      }

      .stat:first-child {
        grid-column: 1 / -1;
      }

      .stat {
        padding: 17px;
      }

      .panel {
        padding: 17px;
      }

      .form-row, .filters {
        grid-template-columns: minmax(0,1fr);
      }

      .auth-card {
        padding: 25px;
      }

      .page-heading h1 {
        font-size: 25px;
      }

      input, select, textarea {
        font-size: 16px;
      }
    }
  `;

  if (!token) {
    return (
      <>
        <style>{styles}</style>

        <div className="auth-page">
          <div className="auth-card">

            <div className="auth-brand">
              <div className="brand-icon">🏗️</div>
              <h1>SiteLog Enterprise</h1>
              <div className="muted">
                Construction Management System
              </div>
            </div>

            <h2 style={{ fontSize: 21, marginBottom: 6 }}>
              {isLoginView ? 'Welcome back' : 'Create your account'}
            </h2>

            <p className="muted" style={{ marginBottom: 24 }}>
              {isLoginView
                ? 'Sign in to access your project workspace.'
                : 'Join the construction project workspace.'}
            </p>

            {authError && (
              <div className="error" role="alert">
                {authError}
              </div>
            )}

            <form className="form-stack" onSubmit={handleAuth}>

              <div>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={authUsername}
                  onChange={e => setAuthUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    autoComplete={isLoginView ? 'current-password' : 'new-password'}
                    required
                  />

                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                className="primary"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? 'Connecting...'
                  : isLoginView
                  ? 'Sign In'
                  : 'Create Account'}
              </button>

            </form>

            <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
              {isLoginView ? 'New to SiteLog?' : 'Already registered?'}

              <button
                className="text-button"
                disabled={authLoading}
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  setAuthError('');
                  setAuthPassword('');
                  setShowPassword(false);
                }}
              >
                {isLoginView ? 'Create Account' : 'Sign In'}
              </button>
            </p>

            <div className="footer" style={{ paddingBottom: 0 }}>
              SiteLog Enterprise • Project Workspace
            </div>

          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <nav className="navbar">

        <div className="nav-brand">
          <div className="brand-icon">🏗️</div>
          <div>
            <h2>SiteLog Enterprise</h2>
            <small>Construction Management System</small>
          </div>
        </div>

        <div className="nav-user">
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 5 }}>
              {username}
            </div>
            <span className="role">
              {isAdmin ? 'ADMINISTRATOR' : 'CONTRIBUTOR'}
            </span>
          </div>

          <button className="logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>

      </nav>

      <main className="container">

        <div className="page-heading">
          <h1>Project Overview</h1>
          <div className="muted">
            Monitor site activities, expenditure and construction records.
          </div>
        </div>

        <div className="stats-grid">

          <div className="stat" style={{ borderTop: '4px solid #2563eb' }}>
            <div className="stat-icon">💰</div>
            <div className="stat-label">Total Expenditure</div>
            <div className="stat-value">{money(totalExpense)}</div>
          </div>

          <div className="stat" style={{ borderTop: '4px solid #0891b2' }}>
            <div className="stat-icon">📋</div>
            <div className="stat-label">Total Activities</div>
            <div className="stat-value">{logs.length}</div>
          </div>

          <div className="stat" style={{ borderTop: '4px solid #d97706' }}>
            <div className="stat-icon">📊</div>
            <div className="stat-label">High-Cost Activities</div>
            <div className="stat-value">{highCostTasks}</div>
            <div className="muted">Above ₹10,000</div>
          </div>

        </div>

        <section className="panel analytics">
          <h2>Expenditure Analysis</h2>
          <div className="muted">
            Category-wise construction expenditure
          </div>

          {categoryTotals.map(item => (
            <div className="chart-row" key={item.name}>

              <div className="chart-label">
                <span>{icons[item.name]} {item.name}</span>
                <strong>{money(item.amount)}</strong>
              </div>

              <div className="chart-track">
                <div
                  className="chart-fill"
                  style={{
                    width: `${totalExpense > 0
                      ? Math.max(0, Math.min(100, item.amount / totalExpense * 100))
                      : 0}%`,
                    background: item.color
                  }}
                />
              </div>

            </div>
          ))}
        </section>

        <div className="workspace-grid">

          <section className="panel">
            <h2>Add Site Record</h2>
            <p className="muted">
              Record construction activities and associated expenses.
            </p>

            <form className="form-stack" onSubmit={handleSubmit}>

              <div>
                <label htmlFor="title">Activity Name</label>
                <input
                  id="title"
                  placeholder="e.g. Foundation excavation"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">

                <div>
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {categories.map(item => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cost">Cost (₹)</label>
                  <input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={materialCost}
                    onChange={e => setMaterialCost(e.target.value)}
                  />
                </div>

              </div>

              <div>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Enter details about the construction activity..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : '+ Save Site Record'}
              </button>

              {message && (
                <div className="notice" role="status">{message}</div>
              )}

            </form>
          </section>

          <section className="panel">

            <h2>Recent Activities</h2>

            <div className="muted">
              {filteredLogs.length} of {logs.length} records
            </div>

            <div className="filters">

              <input
                aria-label="Search activities"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />

              <select
                aria-label="Filter by category"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

            </div>

            {loading && (
              <div className="empty">Loading site records...</div>
            )}

            {loadError && (
              <div className="error">
                {loadError}
                <button
                  className="text-button"
                  onClick={fetchLogs}
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !loadError && filteredLogs.length === 0 && (
              <div className="empty">
                <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                No matching activities found.
              </div>
            )}

            {filteredLogs.map(log => (
              <article className="activity-card" key={log._id}>

                <div className="activity-head">

                  <div className="activity-title">
                    <div className="activity-icon">
                      {icons[log.category] || '🏗️'}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <h3>{log.title}</h3>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Construction activity
                      </div>
                    </div>
                  </div>

                  <div className="cost">
                    {money(log.materialCost)}
                  </div>

                </div>

                <div className="activity-meta">

                  <span className="category-tag">
                    {log.category || 'Excavation'}
                  </span>

                  <span style={{ padding: '4px 0' }}>
                    {log.date
                      ? new Date(log.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Date unavailable'}
                  </span>

                </div>

                <p className="activity-description">
                  {log.description}
                </p>

                {isAdmin && (
                  <button
                    className="delete"
                    onClick={() => handleDelete(log._id)}
                  >
                    Delete Record
                  </button>
                )}

              </article>
            ))}

          </section>

        </div>

        <footer className="footer">
          SiteLog Enterprise | Construction Management System
          <br />
          Built with React, Node.js, Express and MongoDB
        </footer>

      </main>
    </>
  );
}

export default App;
