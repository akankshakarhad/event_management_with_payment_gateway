import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

/* ─── Static maps ─── */
const EMPTY_MEMBER = { name: '', email: '', phone: '', college: '' };

const TITLE_MAP = {
  'GeoFest Arena Quiz':             'Quiz Competition',
  'GeoTalk':                        'Geotalk',
  'Geotalk (Paper Presentation)':   'Geotalk',
  'GeoFest Project Expo':           'Project Display',
  'Connecting the Dots':            'Connecting The Dots',
  'Midas Software Workshop':        'Midas Software Workshop',
};
const norm = (t) => TITLE_MAP[t] || t;

const EVENT_LOGOS = {
  'Quiz Competition':        '/Logos_Events/Quiz.png',
  'Geotalk':                 '/Logos_Events/GeoTalk.png',
  'Connecting The Dots':     '/Logos_Events/Connecting.png',
  'Project Display':         '/Logos_Events/Project.png',
  'Midas Software Workshop': '/Logos_Events/Midas.png',
};
const getLogo = (t) => EVENT_LOGOS[norm(t)] || null;

/* Parallel-event conflict pairs */
const CONFLICT_PAIRS = [
  ['Quiz Competition', 'Midas Software Workshop'],
  ['Connecting The Dots', 'Geotalk'],
];
const getConflict = (title) => {
  const n = norm(title);
  for (const [a, b] of CONFLICT_PAIRS) {
    if (n === a) return b;
    if (n === b) return a;
  }
  return null;
};

const inputCls = (err) =>
  `w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500
   focus:outline-none focus:ring-2 focus:ring-amber-500 transition
   ${err ? 'border-red-500' : 'border-slate-700'}`;

/* ─── Single participant block ─── */
function MemberForm({ member, idx, onChange, onRemove, errors = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-amber-400">
          👤 Participant {idx}
        </span>
        {idx > 1 && (
          <button type="button" onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-xs transition">
            ✕ Remove
          </button>
        )}
      </div>
      {[
        { key: 'name',    label: 'Full Name',           placeholder: 'Arjun Kumar',       type: 'text'  },
        { key: 'email',   label: 'Email',                placeholder: 'arjun@email.com',   type: 'email' },
        { key: 'phone',   label: 'Phone',                placeholder: '10-digit number',   type: 'text'  },
        { key: 'college', label: 'College / University', placeholder: 'NICMAR University', type: 'text'  },
      ].map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="text-xs text-gray-400 mb-1 block">{label}</label>
          <input type={type} className={inputCls(errors[key])}
            placeholder={placeholder} value={member[key]}
            onChange={(e) => onChange(key, e.target.value)} />
          {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}
    </motion.div>
  );
}

/* ─── Event tile ─── */
function EventTile({ ev, index, isSelected, isBlocked, onClick }) {
  const [hovered, setHovered] = useState(false);
  const logo     = getLogo(ev.title);
  const title    = norm(ev.title);
  const indOnly  = ev.max_members === 1;
  const conflict = getConflict(ev.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: isBlocked ? 0.4 : 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={!isBlocked && !isSelected ? { scale: 1.03, y: -4 } : {}}
      whileTap={!isBlocked ? { scale: 0.97 } : {}}
      onClick={() => !isBlocked && onClick(ev)}
      onMouseEnter={() => isBlocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative glass rounded-2xl p-5 flex flex-col transition-all duration-300
        ${isBlocked ? 'cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${isSelected
          ? 'border border-amber-500 ring-2 ring-amber-500/30 bg-amber-600/10'
          : isBlocked
            ? 'border border-slate-700'
            : 'border border-transparent hover:border-amber-500/40 card-hover'
        }`}>

      {isSelected && (
        <div className="absolute top-3 right-3 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
          Selected
        </div>
      )}

      {/* Hover tooltip — only shown when hovering a blocked tile */}
      <AnimatePresence>
        {isBlocked && hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 rounded-2xl flex items-center justify-center z-10 bg-black/50">
            <span className="bg-slate-900 text-amber-300 text-xs font-semibold px-3 py-2 rounded-xl border border-amber-500/30 text-center leading-snug mx-4">
              ⚠️ Parallel to <strong>{conflict}</strong><br />
              <span className="text-gray-400 font-normal">You can only attend one</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16 sm:h-20 mb-3 flex items-center">
        {logo
          ? <img src={logo} alt={title} className="h-full w-auto object-contain" />
          : <span className="text-5xl">🌍</span>
        }
      </div>

      <h3 className={`text-base sm:text-lg font-bold mb-1.5 ${isSelected ? 'text-amber-300' : 'text-white'}`}>
        {title}
      </h3>

      <p className="text-gray-400 text-xs flex-1 leading-relaxed line-clamp-2">
        {ev.description || 'Showcase your knowledge and skills in this exciting event.'}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
          {indOnly ? 'Individual' : `Upto ${ev.max_members}`}
        </span>
        <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full border shrink-0
          ${isSelected
            ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
            : 'bg-amber-600/20 border-amber-500/30 text-amber-300'
          }`}>
          ₹{ev.price}
        </span>
      </div>
    </motion.div>
  );
}

/* ═══ Main Page ═══ */
export default function RegisterPage() {
  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedEvent, setSelEv] = useState(null);
  const [members, setMembers]     = useState([{ ...EMPTY_MEMBER }]);
  const [errors, setErrors]       = useState({});
  const [submitting, setSub]      = useState(false);
  const [paying, setPaying]       = useState(false);
  const [userIds, setUserIds]     = useState(null);
  const [registered, setReg]      = useState(false);

  useEffect(() => {
    api.get('/events')
      .then((r) => setEvents(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  /* Lock body scroll when modal is open */
  useEffect(() => {
    document.body.style.overflow = selectedEvent ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedEvent]);

  /* Close on Escape key */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const maxAllowed    = selectedEvent?.max_members ?? 4;
  const conflictTitle = selectedEvent ? getConflict(selectedEvent.title) : null;
  const totalPrice    = selectedEvent
    ? parseFloat(selectedEvent.price)
    : 0;

  const closeModal = () => { setSelEv(null); setReg(false); setUserIds(null); };

  /* ── Select event → open modal ── */
  const selectEvent = (ev) => {
    if (selectedEvent?.id === ev.id) { closeModal(); return; }
    setSelEv(ev);
    setMembers([{ ...EMPTY_MEMBER }]);
    setErrors({});
    setReg(false);
    setUserIds(null);
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    members.forEach((m, i) => {
      if (!m.name.trim())                                    e[`${i}_name`]    = 'Required';
      if (!m.email.trim())                                   e[`${i}_email`]   = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) e[`${i}_email`]   = 'Invalid email';
      if (!m.phone.trim())                                   e[`${i}_phone`]   = 'Required';
      else if (!/^\d{10}$/.test(m.phone))                   e[`${i}_phone`]   = '10 digits only';
      if (!m.college.trim())                                 e[`${i}_college`] = 'Required';
    });
    return e;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSub(true);
    try {
      const ids = await Promise.all(
        members.map((m) =>
          api.post('/register', { ...m, eventIds: [selectedEvent.id] })
             .then((r) => r.data.data.user.id)
        )
      );
      setUserIds(ids);
      setReg(true);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Registration failed. Try again.' });
    } finally { setSub(false); }
  };

  /* ── Payment ── */
  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await api.post('/create-order', { userIds });
      window.location.href = res.data.data.redirectUrl;
    } catch (err) {
      alert(err.response?.data?.message || 'Could not initiate payment.');
      setPaying(false);
    }
  };

  /* ── Participant helpers ── */
  const updateMember = (i, key, val) =>
    setMembers((p) => p.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  const addMember    = () => members.length < maxAllowed && setMembers((p) => [...p, { ...EMPTY_MEMBER }]);
  const removeMember = (i) => setMembers((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="pt-14 sm:pt-16 min-h-screen text-white overflow-x-hidden">

      {/* ── Hero header ── */}
      <div className="bg-black/50 py-12 sm:py-16 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            Register for <span className="shimmer-text">GeoFest 2026</span>
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
            Click on an event tile to register — fill your details and pay to confirm your spot.
          </p>
        </motion.div>
      </div>

      {/* ── Event tiles ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {[1,2,3,4,5].map((i) => <div key={i} className="h-48 rounded-2xl bg-slate-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {events.map((ev, i) => (
              <EventTile
                key={ev.id} ev={ev} index={i}
                isSelected={selectedEvent?.id === ev.id}
                isBlocked={selectedEvent?.id !== ev.id && conflictTitle === norm(ev.title)}
                onClick={selectEvent}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />

            {/* Modal panel */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">

              <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto
                              bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl">

                {/* Modal header */}
                <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-700/60 px-5 py-4 flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0">
                    {getLogo(selectedEvent.title)
                      ? <img src={getLogo(selectedEvent.title)} alt="" className="h-full w-auto object-contain" />
                      : <span className="text-2xl">🌍</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest">Registering for</p>
                    <h2 className="text-sm sm:text-base font-extrabold text-white truncate leading-tight">
                      {norm(selectedEvent.title)}
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      {maxAllowed === 1 ? 'Individual only' : `Upto ${maxAllowed} participants`}
                      <span className="mx-1.5 text-gray-600">·</span>
                      <span className="text-amber-400 font-semibold">₹{selectedEvent.price} flat fee</span>
                    </p>
                  </div>
                  <button onClick={closeModal}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full
                               text-gray-400 hover:text-white hover:bg-slate-700 transition text-lg">
                    ✕
                  </button>
                </div>

                {/* Modal body */}
                <div className="px-5 py-6">
                  {!registered ? (
                    <form onSubmit={handleSubmit} className="space-y-4">

                      {errors.api && (
                        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
                          {errors.api}
                        </div>
                      )}

                      {/* Participant forms */}
                      <AnimatePresence>
                        {members.map((m, i) => (
                          <MemberForm key={i} member={m} idx={i + 1}
                            onChange={(key, val) => updateMember(i, key, val)}
                            onRemove={() => removeMember(i)}
                            errors={Object.fromEntries(
                              Object.entries(errors)
                                .filter(([k]) => k.startsWith(`${i}_`))
                                .map(([k, v]) => [k.replace(`${i}_`, ''), v])
                            )}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Add participant */}
                      {maxAllowed > 1 && members.length < maxAllowed && (
                        <motion.button type="button" onClick={addMember}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full bg-slate-800 border border-dashed border-amber-600 rounded-2xl py-3
                                     text-amber-400 hover:text-amber-300 text-sm font-semibold transition">
                          + Add Participant ({members.length}/{maxAllowed})
                        </motion.button>
                      )}

                      {/* Total */}
                      <motion.div
                        key={totalPrice} initial={{ scale: 0.97 }} animate={{ scale: 1 }}
                        className="bg-slate-800 rounded-xl px-5 py-4 flex justify-between items-center border border-amber-500/10">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Registration Amount</p>
                          <p className="text-sm text-gray-400">
                            {members.length} participant{members.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-0.5">Total</p>
                          <p className="text-2xl font-extrabold text-amber-400">₹{totalPrice}</p>
                        </div>
                      </motion.div>

                      <motion.button type="submit" disabled={submitting}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold
                                   rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40
                                   transition disabled:opacity-60 text-base">
                        {submitting ? 'Registering...' : 'Register Now →'}
                      </motion.button>
                    </form>

                  ) : (
                    /* ── Payment ── */
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4">
                      <motion.div animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ repeat: 2, duration: 0.4 }} className="text-5xl mb-4">
                        🎉
                      </motion.div>
                      <h3 className="text-xl font-extrabold mb-2">Registration Saved!</h3>
                      <p className="text-gray-400 text-sm mb-1">
                        <span className="text-white font-semibold">{norm(selectedEvent?.title)}</span>
                      </p>
                      <p className="text-gray-400 text-sm mb-6">
                        {members.length} participant{members.length > 1 ? 's' : ''} registered.
                        Complete payment to confirm {members.length > 1 ? 'all spots' : 'your spot'}.
                      </p>
                      <div className="bg-slate-800 rounded-xl px-5 py-4 mb-5">
                        <p className="text-gray-500 text-xs mb-1">Total Amount</p>
                        <p className="text-3xl font-extrabold shimmer-text">₹{totalPrice}</p>
                      </div>
                      <motion.button onClick={handlePayment} disabled={paying}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold
                                   rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-60">
                        {paying ? 'Opening Payment...' : '💳 Pay Now & Confirm Spot'}
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
