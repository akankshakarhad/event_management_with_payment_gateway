import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // ── Registrations state ──
  const [rows, setRows]       = useState([]);
  const [events, setEvents]   = useState([]);
  const [status, setStatus]   = useState('');
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // ── Main tab ──
  const [mainTab, setMainTab] = useState('registrations'); // 'registrations' | 'gallery'

  // ── Gallery state ──
  const [galleryPhotos, setGalleryPhotos]   = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError]     = useState('');
  const [uploadFile, setUploadFile]         = useState(null);
  const [uploadPreview, setUploadPreview]   = useState('');
  const [uploadDesc, setUploadDesc]         = useState('');
  const [uploading, setUploading]           = useState(false);
  const [uploadMsg, setUploadMsg]           = useState('');
  const [deletingId, setDeletingId]         = useState('');
  const [lightbox, setLightbox]             = useState(null); // photo object
  const fileInputRef = useRef(null);

  // ── Fetch registrations ──
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

  // ── Fetch gallery ──
  const fetchGallery = async () => {
    setGalleryLoading(true); setGalleryError('');
    try {
      const res = await api.get('/gallery');
      setGalleryPhotos(res.data.data);
    } catch { setGalleryError('Failed to load gallery.'); }
    finally { setGalleryLoading(false); }
  };

  useEffect(() => {
    if (unlocked) {
      api.get('/events').then((r) => setEvents(r.data.data));
      fetchGallery();
    }
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
      await api.post('/admin/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-admin-password': ADMIN_PASSWORD,
        },
      });
      setUploadFile(null);
      setUploadPreview('');
      setUploadDesc('');
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
            <p className="text-gray-500 text-sm">Manage registrations and event gallery</p>
          </div>
          {mainTab === 'registrations' && (
            <motion.button onClick={handleExport}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition">
              ⬇ Export Excel
            </motion.button>
          )}
        </motion.div>

        {/* Main Tabs */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-1 flex gap-1 mb-8 w-fit">
          {[
            { label: '📋 Registrations', value: 'registrations' },
            { label: '🖼 Gallery',        value: 'gallery' },
          ].map((t) => (
            <button key={t.value} onClick={() => setMainTab(t.value)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                mainTab === t.value
                  ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* ── REGISTRATIONS TAB ── */}
        {mainTab === 'registrations' && (
          <>
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
