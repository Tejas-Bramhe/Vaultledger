import { useState, useEffect } from 'react';

export default function App() {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [showTransact, setShowTransact] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [tab, setTab] = useState('deposit');

  const [createForm, setCreateForm] = useState({ name: '', type: 'Savings' });
  const [transactForm, setTransactForm] = useState({ amount: '', to: '' });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(t); } }, [success]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/accounts');
      if (res.ok) setAccounts(await res.json());
      else setError('Failed to load accounts.');
    } catch { setError('Cannot connect to server.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const total = accounts.reduce((s, a) => s + parseFloat(a.account_balance), 0);
  const avg = accounts.length ? total / accounts.length : 0;

  const filtered = accounts.filter(a =>
    a.user_name.toLowerCase().includes(search.toLowerCase()) ||
    a.account_number.includes(search)
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return setError('Name is required.');
    try {
      const res = await fetch('/api/accounts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createForm.name, type: createForm.type })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(`Account ${data.account_number} created.`);
        setShowCreate(false);
        setCreateForm({ name: '', type: 'Savings' });
        load();
      } else setError(data.error);
    } catch { setError('Server error.'); }
  };

  const handleTransact = async (e) => {
    e.preventDefault();
    const amt = parseFloat(transactForm.amount);
    if (isNaN(amt) || amt <= 0) return setError('Enter a valid amount.');

    let body, endpoint = `/api/accounts/${tab}`;
    if (tab === 'transfer') {
      if (!transactForm.to) return setError('Enter destination account.');
      body = { fromAccountNumber: selectedAccount, toAccountNumber: transactForm.to, amount: amt };
    } else {
      body = { accountNumber: selectedAccount, amount: amt };
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setShowTransact(false);
        setTransactForm({ amount: '', to: '' });
        load();
      } else setError(data.error);
    } catch { setError('Server error.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm(`Delete account ${id}?`)) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { setSuccess(data.message); load(); }
      else setError(data.error);
    } catch { setError('Server error.'); }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/accounts/export', { method: 'POST' });
      const data = await res.json();
      if (res.ok) setSuccess('Exported to data/accounts.csv');
      else setError(data.error);
    } catch { setError('Server error.'); }
  };

  const openTransact = (accNum, action) => {
    setSelectedAccount(accNum);
    setTab(action);
    setTransactForm({ amount: '', to: '' });
    setShowTransact(true);
  };

  const fmt = (n) => parseFloat(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>VaultLedger</h1>
        <div className="header-actions">
          <button className="btn" onClick={load}>↻ Refresh</button>
          <button className="btn" onClick={handleExport}>↓ Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Account</button>
        </div>
      </header>

      {/* Alerts */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div className="label">Total Balance</div>
          <div className="value">${fmt(total)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Accounts</div>
          <div className="value">{accounts.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Avg Balance</div>
          <div className="value">${fmt(avg)}</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          placeholder="Search by name or account number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="empty"><p>Loading...</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p><strong>No accounts found</strong></p>
            <p>Create one to get started.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Account No.</th>
                <th>Name</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.account_number}>
                  <td className="mono">{a.account_number}</td>
                  <td>{a.user_name}</td>
                  <td>
                    <span className={`badge badge-${a.account_type.toLowerCase()}`}>
                      {a.account_type}
                    </span>
                  </td>
                  <td><strong>${fmt(a.account_balance)}</strong></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-sm" onClick={() => openTransact(a.account_number, 'deposit')}>Deposit</button>
                      <button className="btn btn-sm" onClick={() => openTransact(a.account_number, 'withdraw')}>Withdraw</button>
                      <button className="btn btn-sm" onClick={() => openTransact(a.account_number, 'transfer')}>Transfer</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.account_number)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Account</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="field">
                <label>Name</label>
                <input required placeholder="Full name" value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Account Type</label>
                <select value={createForm.type}
                  onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransact && (
        <div className="overlay" onClick={() => setShowTransact(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Transaction</h2>
              <button className="modal-close" onClick={() => setShowTransact(false)}>×</button>
            </div>

            <div className="tabs">
              <button className={`tab ${tab === 'deposit' ? 'active' : ''}`} onClick={() => setTab('deposit')}>Deposit</button>
              <button className={`tab ${tab === 'withdraw' ? 'active' : ''}`} onClick={() => setTab('withdraw')}>Withdraw</button>
              <button className={`tab ${tab === 'transfer' ? 'active' : ''}`} onClick={() => setTab('transfer')}>Transfer</button>
            </div>

            <form onSubmit={handleTransact}>
              <div className="field">
                <label>From Account</label>
                <input disabled value={selectedAccount} />
              </div>
              {tab === 'transfer' && (
                <div className="field">
                  <label>To Account</label>
                  <input required placeholder="Destination account number" value={transactForm.to}
                    onChange={(e) => setTransactForm({ ...transactForm, to: e.target.value })} />
                </div>
              )}
              <div className="field">
                <label>Amount ($)</label>
                <input type="number" step="0.01" min="0.01" required placeholder="0.00" value={transactForm.amount}
                  onChange={(e) => setTransactForm({ ...transactForm, amount: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowTransact(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
