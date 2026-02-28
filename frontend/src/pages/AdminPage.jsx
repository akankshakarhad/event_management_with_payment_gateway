import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api';

const ADMIN_PASSWORD = '6tfcvgY%2026GeoFest';

const STATUS_TABS = [
  { label: 'All',        value: '' },
  { label: '✅ Paid',    value: 'PAID' },
  { label: '⏳ Pending', value: 'PENDING' },
];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput]   = useState('');
  const [pwError, setPwError]   = useState('');

  const [rows, setRows]       = useState([]);
  const [events, setEvents]   = useState([]);
  const [status, setStatus]   = useState('');
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (status)  params.status  = status;
      if (eventId) params.eventId = eventId;
      const res = await api.get('/admin/users', { params });
      setRows(res.data.data);
    } catch { setError('Failed to load data.'); }
    finally   { setLoading(false); }
  };

  useEffect(() => {
    if (unlocked) api.get('/events').then((r) => setEvents(r.data.data));
  }, [unlocked]);

  useEffect(() => {
    if (unlocked) fetchData();
  }, [unlocked, status, eventId]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setUnlocked(true);
      setPwError('');
    } else {
      setPwError('Incorrect password. Please try again.');
      setPwInput('');
    }
  };

  const handleExport = () => {
    const p = new URLSearchParams();
    if (status)  p.append('status',  status);
    if (eventId) p.append('eventId', eventId);
    window.open(`/api/admin/export?${p.toString()}`, '_blank');
  };

  if (!unlocked) {
    return (
      <div className="pt-16 min-h-screen text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm">
          <div className="glass rounded-2xl p-8 border border-slate-700/60 shadow-2xl">
            <div className="text-center mb-7">
              <div className="text-4xl mb-3">🔐</div>
              <h1 className="text-2xl font-extrabold mb-1">Admin Access</h1>
              <p className="text-gray-500 text-sm">Enter the password to continue</p>
            </div>
            <form onSubmit={handleUnlock} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Password</label>
                <input
                  type="password"
                  autoFocus
                  value={pwInput}
                  onChange={(e) => { setPwInput(e.target.value); setPwError(''); }}
                  placeholder="Enter admin password"
                  className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-amber-500 transition
                    ${pwError ? 'border-red-500' : 'border-slate-700'}`}
                />
                {pwError && (
                  <p className="text-red-400 text-xs mt-1.5">{pwError}</p>
                )}
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold
                           rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition text-sm">
                Unlock Dashboard
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  const paidCount    = rows.filter((r) => r.status === 'PAID').length;
  const pendingCount = rows.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="pt-16 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-1">
              Admin <span className="shimmer-text">Dashboard</span>
            </h1>
            <p className="text-gray-500 text-sm">Manage registrations and export data</p>
          </div>
          <motion.button onClick={handleExport}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition">
            ⬇ Export Excel
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total',   value: rows.length,  color: 'text-amber-400'  },
            { label: 'Paid',    value: paidCount,    color: 'text-emerald-400' },
            { label: 'Pending', value: pendingCount, color: 'text-yellow-400'  },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 text-center">
              <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
              <div className="text-gray-500 text-xs mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <div className="glass rounded-xl p-1 flex gap-1">
            {STATUS_TABS.map((t) => (
              <button key={t.value} onClick={() => setStatus(t.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  status === t.value
                    ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <select value={eventId} onChange={(e) => setEventId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.title}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-400 text-center py-16">{error}</p>
        ) : rows.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <div className="text-5xl mb-4">🔍</div>
            <p>No registrations found.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass rounded-2xl overflow-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/60">
                  {['Name','Email','Phone','College','Event','Price','Status'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((r, i) => (
                  <motion.tr key={r.registration_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">{r.name}</td>
                    <td className="px-5 py-3.5 text-gray-400">{r.email}</td>
                    <td className="px-5 py-3.5 text-gray-400">{r.phone}</td>
                    <td className="px-5 py-3.5 text-gray-400 max-w-[160px] truncate">{r.college}</td>
                    <td className="px-5 py-3.5 text-gray-300">{r.event_title}</td>
                    <td className="px-5 py-3.5 text-amber-400 font-semibold">₹{r.price}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.status === 'PAID'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-yellow-500/15 text-yellow-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}
