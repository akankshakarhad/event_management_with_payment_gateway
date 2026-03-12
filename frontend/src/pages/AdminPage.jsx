import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

const ADMIN_PASSWORD = '6tfcvgY%2026GeoFest';

const STATUS_TABS = [
  { label: 'All',     value: '' },
  { label: 'Paid',    value: 'PAID' },
  { label: 'Pending', value: 'PENDING' },
];

const PAYMENT_STATUS_TABS = [
  { label: 'All',                value: '' },
  { label: 'Needs Verification', value: 'VERIFICATION_PENDING' },
  { label: 'Approved',           value: 'APPROVED' },
  { label: 'Rejected',           value: 'REJECTED' },
  { label: 'Unpaid',             value: 'PENDING' },
];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput]   = useState('');
  const [pwError, setPwError]   = useState('');

  // ── Registrations state ──
  const [groups, setGroups]         = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [events, setEvents]         = useState([]);
  const [status, setStatus]         = useState('');
  const [eventId, setEventId]       = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // ── Main tab ──
  const [mainTab, setMainTab] = useState('registrations'); // 'registrations' | 'payments' | 'gallery' | 'rulebook'

  // ── Payments state ──
  const [payments, setPayments]         = useState([]);
  const [payStatus, setPayStatus]       = useState('');
  const [payLoading, setPayLoading]     = useState(false);
  const [payError, setPayError]         = useState('');
  const [actionLoading, setActionLoading] = useState(''); // payment id being actioned

  // ── Gallery state ──
  const [galleryPhotos, setGalleryPhotos]   = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError]     = useState('');
  const [uploadFile, setUploadFile]           = useState(null);
  const [uploadPreview, setUploadPreview]     = useState('');
  const [uploadDesc, setUploadDesc]           = useState('');
  const [uploadEventId, setUploadEventId]     = useState('');
  const [uploading, setUploading]             = useState(false);
  const [uploadMsg, setUploadMsg]             = useState('');
  const [deletingId, setDeletingId]           = useState('');
  const [lightbox, setLightbox]               = useState(null); // photo object
  const fileInputRef = useRef(null);

  // ── Rule Book state ──
  const [rulebooks, setRulebooks]             = useState([]);
  const [rulebookLoading, setRulebookLoading] = useState(false);
  const [rulebookError, setRulebookError]     = useState('');
  const [rbFile, setRbFile]                   = useState(null);
  const [rbEventId, setRbEventId]             = useState('');
  const [rbUploading, setRbUploading]         = useState(false);
  const [rbMsg, setRbMsg]                     = useState('');
  const [rbDeletingId, setRbDeletingId]       = useState('');
  const rbInputRef = useRef(null);

  // ── Fetch payments ──
  const fetchPayments = async () => {
    setPayLoading(true); setPayError('');
    try {
      const params = {};
      if (payStatus) params.status = payStatus;
      const res = await api.get('/admin/payments', { params });
      setPayments(res.data.data);
    } catch { setPayError('Failed to load payments.'); }
    finally   { setPayLoading(false); }
  };

  const handleApprove = async (p) => {
    setActionLoading(p.id);
    try {
      await api.post(`/admin/payments/${p.id}/approve`, { name: p.name, email: p.email }, {
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    } finally { setActionLoading(''); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this payment?')) return;
    setActionLoading(id);
    try {
      await api.post(`/admin/payments/${id}/reject`, {}, {
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      fetchPayments();
    } catch (err) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally { setActionLoading(''); }
  };

  const handleExportPayments = () => {
    window.open('/api/admin/export', '_blank');
  };

  // ── Fetch registrations (grouped) ──
  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      if (status)  params.status  = status;
      if (eventId) params.eventId = eventId;
      const res = await api.get('/admin/groups', { params });
      setGroups(res.data.data);
    } catch { setError('Failed to load data.'); }
    finally   { setLoading(false); }
  };

  const toggleGroup = (id) => setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleDeleteGroup = async (g) => {
    if (!window.confirm(`Delete entire group "${g.reference_id}" and all their registrations? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/groups/${g.payment_id}`, {
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group.');
    }
  };

  const handleDeleteMember = async (g, m) => {
    if (!window.confirm(`Remove "${m.name}" from group "${g.reference_id}"? Their registrations will be deleted.`)) return;
    try {
      await api.delete(`/admin/groups/${g.payment_id}/members/${m.user_id}`, {
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  // ── Fetch gallery ──
  const fetchGallery = async () => {
    setGalleryLoading(true); setGalleryError('');
    try {
      const res = await api.get('/gallery');
      setGalleryPhotos(res.data.data);
    } catch { setGalleryError('Failed to load gallery.'); }
    finally { setGalleryLoading(false); }
  };

  // ── Fetch rule books ──
  const fetchRulebooks = async () => {
    setRulebookLoading(true); setRulebookError('');
    try {
      const res = await api.get('/rulebook');
      setRulebooks(res.data.data);
    } catch { setRulebookError('Failed to load rule books.'); }
    finally { setRulebookLoading(false); }
  };

  useEffect(() => {
    if (unlocked) {
      api.get('/events').then((r) => setEvents(r.data.data));
      fetchGallery();
      fetchRulebooks();
    }
  }, [unlocked]);

  useEffect(() => {
    if (unlocked) fetchData();
  }, [unlocked, status, eventId]);

  useEffect(() => {
    if (unlocked) fetchPayments();
  }, [unlocked, payStatus]);

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

  // ── Gallery handlers ──
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
    setUploadMsg('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true); setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('description', uploadDesc);
      if (uploadEventId) formData.append('eventId', uploadEventId);
      await api.post('/admin/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-password': ADMIN_PASSWORD,
        },
      });
      setUploadFile(null);
      setUploadPreview('');
      setUploadDesc('');
      setUploadEventId('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadMsg('Photo uploaded successfully!');
      fetchGallery();
    } catch {
      setUploadMsg('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/admin/gallery/${id}`, {
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
      if (lightbox?.id === id) setLightbox(null);
    } catch {
      alert('Failed to delete photo.');
    } finally {
      setDeletingId('');
    }
  };

  // ── Rule Book handlers ──
  const handleRbUpload = async (e) => {
    e.preventDefault();
    if (!rbFile || !rbEventId) return;
    setRbUploading(true); setRbMsg('');
    try {
      const formData = new FormData();
      formData.append('file', rbFile);
      formData.append('eventId', rbEventId);
      await api.post('/admin/rulebook', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-password': ADMIN_PASSWORD,
        },
      });
      setRbFile(null);
      setRbEventId('');
      if (rbInputRef.current) rbInputRef.current.value = '';
      setRbMsg('Rule book uploaded successfully!');
      fetchRulebooks();
    } catch {
      setRbMsg('Upload failed. Please try again.');
    } finally {
      setRbUploading(false);
    }
  };

  const handleRbDelete = async (id) => {
    if (!window.confirm('Delete this rule book?')) return;
    setRbDeletingId(id);
    try {
      await api.delete(`/admin/rulebook/${id}`, {
        headers: { 'x-admin-password': ADMIN_PASSWORD },
      });
      setRulebooks((prev) => prev.filter((r) => r.id !== id));
      setRbMsg('');
    } catch {
      alert('Failed to delete rule book.');
    } finally {
      setRbDeletingId('');
    }
  };

  // ── Lock screen ──
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

  const paidCount    = groups.filter((g) => g.payment_status === 'APPROVED').length;
  const pendingCount = groups.filter((g) => g.payment_status !== 'APPROVED').length;

  return (
    <div className="pt-16 min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-6 sm:mb-8 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold mb-1">
              Admin <span className="shimmer-text">Dashboard</span>
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">Manage registrations, payments and event gallery</p>
          </div>
          <div className="flex gap-2">
            {mainTab === 'registrations' && (
              <motion.button onClick={handleExport}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition whitespace-nowrap">
                Export Regs
              </motion.button>
            )}
            {mainTab === 'payments' && (
              <motion.button onClick={handleExportPayments}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition whitespace-nowrap">
                Export CSV
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Main Tabs — horizontally scrollable on mobile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="overflow-x-auto -mx-4 px-4 mb-6 sm:mb-8 pb-1">
          <div className="glass rounded-xl p-1 flex gap-1 w-max">
            {[
              { label: 'Registrations', value: 'registrations' },
              { label: 'Payments',      value: 'payments' },
              { label: 'Gallery',       value: 'gallery' },
              { label: 'Rule Book',     value: 'rulebook' },
            ].map((t) => (
              <button key={t.value} onClick={() => setMainTab(t.value)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition whitespace-nowrap ${
                  mainTab === t.value
                    ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── REGISTRATIONS TAB ── */}
        {mainTab === 'registrations' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Total Groups', value: groups.length,  color: 'text-amber-400'   },
                { label: 'Approved',     value: paidCount,      color: 'text-emerald-400' },
                { label: 'Pending',      value: pendingCount,   color: 'text-yellow-400'  },
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

            {/* Group Cards */}
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <p className="text-red-400 text-center py-16">{error}</p>
            ) : groups.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <div className="text-5xl mb-4">🔍</div>
                <p>No registration groups found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groups.map((g, i) => {
                  const isExpanded = !!expandedGroups[g.payment_id];
                  const payBadge =
                    g.payment_status === 'APPROVED'             ? { label: 'Approved',      cls: 'bg-emerald-500/15 text-emerald-400' } :
                    g.payment_status === 'VERIFICATION_PENDING' ? { label: 'Needs Review',   cls: 'bg-yellow-500/15 text-yellow-400'  } :
                    g.payment_status === 'REJECTED'             ? { label: 'Rejected',       cls: 'bg-red-500/15 text-red-400'        } :
                                                                  { label: 'Unpaid',         cls: 'bg-slate-500/15 text-slate-400'   };
                  const totalEvents = g.members.reduce((acc, m) => acc + m.registrations.length, 0);

                  return (
                    <motion.div key={g.payment_id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass rounded-2xl border border-slate-700/50 overflow-hidden">

                      {/* Group header – click to expand */}
                      <div className="flex items-stretch">
                      <button
                        onClick={() => toggleGroup(g.payment_id)}
                        className="flex-1 text-left px-5 py-4 flex flex-wrap items-center gap-3 hover:bg-slate-800/40 transition-colors">

                        {/* Expand chevron */}
                        <span className={`text-gray-500 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>

                        {/* Reference ID */}
                        <span className="font-mono text-amber-400 text-xs font-bold whitespace-nowrap">
                          {g.reference_id}
                        </span>

                        {/* Leader */}
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-white text-sm">{g.leader.name}</span>
                          <span className="text-gray-500 text-xs ml-2">{g.leader.email}</span>
                        </div>

                        {/* Members count */}
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {g.members.length} member{g.members.length !== 1 ? 's' : ''}
                        </span>

                        {/* Events count */}
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {totalEvents} event{totalEvents !== 1 ? 's' : ''}
                        </span>

                        {/* Amount */}
                        <span className="text-emerald-400 font-bold text-sm whitespace-nowrap">
                          ₹{g.amount}
                        </span>

                        {/* Payment status */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${payBadge.cls}`}>
                          {payBadge.label}
                        </span>
                      </button>
                      {/* Delete group button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g); }}
                        title="Delete entire group"
                        className="px-4 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-l border-slate-700/50 text-lg">
                        ✕
                      </button>
                      </div>

                      {/* Expanded: member details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-slate-700/50">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="bg-slate-800/60">
                                    {['Member','Email','Phone','College','Event','Mode','Reg. Status',''].map((h) => (
                                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                  {g.members.flatMap((m) => {
                                    if (m.registrations.length === 0) {
                                      return [(
                                        <tr key={m.user_id} className="hover:bg-slate-800/30 transition-colors">
                                          <td className="px-5 py-3 font-medium text-white whitespace-nowrap">{m.name}</td>
                                          <td className="px-5 py-3 text-gray-400 text-xs">{m.email}</td>
                                          <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{m.phone}</td>
                                          <td className="px-5 py-3 text-gray-400 text-xs max-w-[160px] truncate">{m.college}</td>
                                          <td className="px-5 py-3 text-gray-600 text-xs">—</td>
                                          <td className="px-5 py-3 text-gray-600 text-xs">—</td>
                                          <td className="px-5 py-3 text-gray-600 text-xs">—</td>
                                          <td className="px-3 py-3 text-right">
                                            <button onClick={() => handleDeleteMember(g, m)} title="Remove member"
                                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded px-2 py-1 text-xs transition-colors">
                                              Remove
                                            </button>
                                          </td>
                                        </tr>
                                      )];
                                    }
                                    return m.registrations.map((r, rIdx) => (
                                      <tr key={`${m.user_id}-${r.registration_id}`} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3 font-medium text-white whitespace-nowrap">{m.name}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs">{m.email}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">{m.phone}</td>
                                        <td className="px-5 py-3 text-gray-400 text-xs max-w-[160px] truncate">{m.college}</td>
                                        <td className="px-5 py-3 text-gray-300 text-xs whitespace-nowrap">
                                          <span className="inline-block bg-slate-700/60 text-gray-300 rounded-full px-2 py-0.5 text-xs whitespace-nowrap">
                                            {r.event_title}
                                          </span>
                                        </td>
                                        <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                                          {r.mode_of_participation || '—'}
                                        </td>
                                        <td className="px-5 py-3">
                                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                            r.status === 'PAID'
                                              ? 'bg-emerald-500/15 text-emerald-400'
                                              : 'bg-yellow-500/15 text-yellow-400'
                                          }`}>
                                            {r.status}
                                          </span>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                          {rIdx === 0 && (
                                            <button onClick={() => handleDeleteMember(g, m)} title="Remove member"
                                              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded px-2 py-1 text-xs transition-colors">
                                              Remove
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ));
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── PAYMENTS TAB ── */}
        {mainTab === 'payments' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total',        value: payments.length,                                            color: 'text-amber-400'  },
                { label: 'Needs Review', value: payments.filter((p) => p.status === 'VERIFICATION_PENDING').length, color: 'text-yellow-400'  },
                { label: 'Approved',     value: payments.filter((p) => p.status === 'APPROVED').length,      color: 'text-emerald-400' },
                { label: 'Rejected',     value: payments.filter((p) => p.status === 'REJECTED').length,      color: 'text-red-400'     },
              ].map((s) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-5 text-center">
                  <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Status filter — scrollable on mobile */}
            <div className="overflow-x-auto -mx-4 px-4 mb-6 pb-1">
              <div className="glass rounded-xl p-1 flex gap-1 w-max">
                {PAYMENT_STATUS_TABS.map((t) => (
                  <button key={t.value} onClick={() => setPayStatus(t.value)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                      payStatus === t.value
                        ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                        : 'text-gray-400 hover:text-white'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            {payLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-14 rounded-xl bg-slate-800 animate-pulse" />)}
              </div>
            ) : payError ? (
              <p className="text-red-400 text-center py-16">{payError}</p>
            ) : payments.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <div className="text-5xl mb-4">💳</div>
                <p>No payments found.</p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-2xl overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/60">
                      {['Name','Email','Reference ID','Amount','UTR','Screenshot','Status','Actions'].map((h) => (
                        <th key={h} className="text-left px-4 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {payments.map((p, i) => (
                      <motion.tr key={p.id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{p.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{p.email}</td>
                        <td className="px-4 py-3 font-mono text-amber-400 text-xs font-bold whitespace-nowrap">{p.reference_id}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">Rs.{p.amount}</td>
                        <td className="px-4 py-3 font-mono text-gray-300 text-xs">{p.utr || '—'}</td>
                        <td className="px-4 py-3">
                          {p.screenshot_url
                            ? <a href={p.screenshot_url} target="_blank" rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-xs underline">View</a>
                            : <span className="text-gray-600 text-xs">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            p.status === 'APPROVED'             ? 'bg-emerald-500/15 text-emerald-400' :
                            p.status === 'VERIFICATION_PENDING' ? 'bg-yellow-500/15 text-yellow-400'  :
                            p.status === 'REJECTED'             ? 'bg-red-500/15 text-red-400'        :
                                                                  'bg-slate-500/15 text-slate-400'
                          }`}>
                            {p.status === 'VERIFICATION_PENDING' ? 'Needs Review' : p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {p.status === 'VERIFICATION_PENDING' && (
                            <div className="flex gap-2">
                              <button onClick={() => handleApprove(p)}
                                disabled={actionLoading === p.id}
                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                                {actionLoading === p.id ? '...' : 'Approve'}
                              </button>
                              <button onClick={() => handleReject(p.id)}
                                disabled={actionLoading === p.id}
                                className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap">
                                {actionLoading === p.id ? '...' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </>
        )}

        {/* ── GALLERY TAB ── */}
        {mainTab === 'gallery' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Upload form */}
            <div className="glass rounded-2xl p-6 border border-slate-700/60 mb-8">
              <h2 className="text-lg font-bold mb-5">Upload Event Photo</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors">
                  {uploadPreview ? (
                    <img src={uploadPreview} alt="preview"
                      className="max-h-48 mx-auto rounded-lg object-contain" />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-400 text-sm">Click to select an image</p>
                      <p className="text-gray-600 text-xs mt-1">JPG, PNG, WEBP · Max 5 MB</p>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange}
                  className="hidden" />

                <select
                  value={uploadEventId}
                  onChange={(e) => setUploadEventId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-gray-300 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500 transition">
                  <option value="">Select Event (optional)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>

                <textarea
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Add a description (optional)…"
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white
                             placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none transition"
                />

                <div className="flex items-center gap-3">
                  <motion.button type="submit" disabled={!uploadFile || uploading}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold px-6 py-2.5
                               rounded-xl text-sm shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    {uploading ? 'Uploading…' : '⬆ Upload Photo'}
                  </motion.button>
                  {uploadFile && (
                    <button type="button" onClick={() => { setUploadFile(null); setUploadPreview(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-gray-500 hover:text-red-400 text-sm transition">
                      Clear
                    </button>
                  )}
                  {uploadMsg && (
                    <p className={`text-sm ${uploadMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {uploadMsg}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Existing photos */}
            <h2 className="text-lg font-bold mb-4">
              Gallery Photos
              <span className="ml-2 text-gray-500 text-sm font-normal">({galleryPhotos.length})</span>
            </h2>

            {galleryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : galleryError ? (
              <p className="text-red-400">{galleryError}</p>
            ) : galleryPhotos.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-5xl mb-4">🖼</div>
                <p>No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {galleryPhotos.map((photo) => (
                  <motion.div key={photo.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative rounded-xl overflow-hidden aspect-square bg-slate-800 cursor-pointer"
                    onClick={() => setLightbox(photo)}>
                    <img src={photo.image_data} alt={photo.description || 'Gallery photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {photo.description && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent
                                      p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-white text-xs line-clamp-2">{photo.description}</p>
                      </div>
                    )}
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(photo.id); }}
                      disabled={deletingId === photo.id}
                      className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-500 text-white text-xs
                                 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all
                                 duration-200 disabled:opacity-50">
                      {deletingId === photo.id ? '…' : '✕ Delete'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        {/* ── RULE BOOK TAB ── */}
        {mainTab === 'rulebook' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

            {/* Upload form */}
            <div className="glass rounded-2xl p-4 sm:p-6 border border-slate-700/60 mb-8">
              <h2 className="text-lg font-bold mb-1">Upload Rule Book</h2>
              <p className="text-gray-500 text-xs mb-4">
                PDF, DOC, DOCX, JPG, PNG or any format &middot; Max 20 MB.
                Uploading for an event replaces any existing rule book for that event.
              </p>
              <form onSubmit={handleRbUpload} className="space-y-4">

                {/* Event selector — required */}
                <select
                  value={rbEventId}
                  onChange={(e) => setRbEventId(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-gray-300 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500 transition">
                  <option value="">Select Event *</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>

                {/* File drop zone */}
                <div
                  onClick={() => rbInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-5 text-center cursor-pointer transition-colors">
                  {rbFile ? (
                    <div>
                      <div className="text-3xl mb-1">📄</div>
                      <p className="text-white text-sm font-medium truncate">{rbFile.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{(rbFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl mb-1">📋</div>
                      <p className="text-gray-400 text-sm">Tap to select file</p>
                      <p className="text-gray-600 text-xs mt-1">PDF, DOC, DOCX, JPG… &middot; Max 20 MB</p>
                    </>
                  )}
                </div>
                <input
                  ref={rbInputRef}
                  type="file"
                  onChange={(e) => { setRbFile(e.target.files[0] || null); setRbMsg(''); }}
                  className="hidden"
                />

                <div className="flex items-center gap-3 flex-wrap">
                  <motion.button type="submit" disabled={!rbFile || !rbEventId || rbUploading}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold px-5 py-2.5
                               rounded-xl text-sm shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition">
                    {rbUploading ? 'Uploading…' : 'Upload Rule Book'}
                  </motion.button>
                  {rbFile && (
                    <button type="button"
                      onClick={() => { setRbFile(null); if (rbInputRef.current) rbInputRef.current.value = ''; }}
                      className="text-gray-500 hover:text-red-400 text-sm transition">
                      Clear
                    </button>
                  )}
                  {rbMsg && (
                    <p className={`text-sm ${rbMsg.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rbMsg}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Existing rule books list */}
            <h2 className="text-lg font-bold mb-4">
              Uploaded Rule Books
              <span className="ml-2 text-gray-500 text-sm font-normal">({rulebooks.length})</span>
            </h2>

            {rulebookLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />)}
              </div>
            ) : rulebookError ? (
              <p className="text-red-400">{rulebookError}</p>
            ) : rulebooks.length === 0 ? (
              <div className="text-center py-16 text-gray-600">
                <div className="text-5xl mb-4">📭</div>
                <p>No rule books uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rulebooks.map((rb) => (
                  <div key={rb.id}
                    className="glass rounded-xl p-4 border border-slate-700/60 flex items-center gap-3 flex-wrap">
                    <span className="text-2xl shrink-0">
                      {rb.file_type === 'application/pdf' ? '📄'
                        : rb.file_type?.startsWith('image/') ? '🖼'
                        : '📋'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{rb.file_name}</p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {rb.event_title ? (
                          <span className="text-amber-400 font-medium">{rb.event_title} &middot; </span>
                        ) : null}
                        {new Date(rb.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                    <a href={`/api/rulebook/${rb.id}/view`} target="_blank" rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition shrink-0">
                      View
                    </a>
                    <button
                      onClick={() => handleRbDelete(rb.id)}
                      disabled={rbDeletingId === rb.id}
                      className="bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold
                                 px-3 py-1.5 rounded-lg transition whitespace-nowrap shrink-0">
                      {rbDeletingId === rb.id ? '…' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full">
              <img src={lightbox.image_data} alt={lightbox.description || 'Gallery photo'}
                className="w-full rounded-2xl object-contain max-h-[80vh]" />
              {lightbox.description && (
                <p className="text-white text-center mt-3 text-sm">{lightbox.description}</p>
              )}
              <button onClick={() => setLightbox(null)}
                className="absolute -top-4 -right-4 bg-slate-700 hover:bg-slate-600 text-white w-9 h-9
                           rounded-full text-lg flex items-center justify-center transition">
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
