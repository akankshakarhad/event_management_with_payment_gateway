import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';


const EMPTY_MEMBER = { name: '', email: '', phone: '', college: '' };

const inputCls = (err) =>
  `w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500
   focus:outline-none focus:ring-2 focus:ring-amber-500 transition
   ${err ? 'border-red-500' : 'border-slate-700'}`;

/* ─── Single member form block ─── */
function MemberForm({ member, idx, onChange, onRemove, errors = {}, isLeader }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-amber-400">
          {isLeader ? '👑 Team Leader' : `👤 Member ${idx}`}
        </span>
        {!isLeader && (
          <button type="button" onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-xs transition">
            ✕ Remove
          </button>
        )}
      </div>
      {[
        { key: 'name',    label: 'Full Name',  placeholder: 'Arjun Kumar',     type: 'text'  },
        { key: 'email',   label: 'Email',       placeholder: 'arjun@email.com', type: 'email' },
        { key: 'phone',   label: 'Phone',       placeholder: '10-digit number', type: 'text'  },
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

/* ─── Main Page ─── */
export default function RegisterPage() {
  const [params]  = useSearchParams();
  const initMode  = params.get('mode') === 'group' ? 'group' : 'individual';

  const [mode, setMode]         = useState(initMode);
  const [events, setEvents]     = useState([]);
  const [selectedIds, setIds]   = useState([]);
  const [members, setMembers]   = useState([{ ...EMPTY_MEMBER }]);
  const [teamName, setTeamName] = useState('');
  const [errors, setErrors]     = useState({});
  const [submitting, setSub]    = useState(false);
  const [paying, setPaying]     = useState(false);
  const [userIds, setUserIds]   = useState(null);
  const [registered, setReg]    = useState(false);

  useEffect(() => { api.get('/events').then((r) => setEvents(r.data.data)); }, []);
  useEffect(() => {
    setMembers([{ ...EMPTY_MEMBER }]);
    setErrors({});
    setReg(false);
    setUserIds(null);
  }, [mode]);

  const selectedEvents = events.filter((e) => selectedIds.includes(e.id));
  const maxAllowed = selectedEvents.length
    ? Math.min(...selectedEvents.map((e) => e.max_members ?? 4))
    : 4;

  const totalPrice = selectedEvents
    .reduce((s, e) => s + parseFloat(e.price), 0) * (mode === 'group' ? members.length : 1);

  const toggleEvent = (id) => {
    setIds((p) => {
      const next = p.includes(id) ? p.filter((x) => x !== id) : [...p, id];
      const nextSelected = events.filter((e) => next.includes(e.id));
      if (nextSelected.some((e) => (e.max_members ?? 4) === 1)) setMode('individual');
      return next;
    });
  };

  /* ── Validation ── */
  const validateMember = (m, i) => {
    const e = {};
    if (!m.name.trim())                                     e[`${i}_name`]    = 'Required';
    if (!m.email.trim())                                    e[`${i}_email`]   = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email))  e[`${i}_email`]   = 'Invalid email';
    if (!m.phone.trim())                                    e[`${i}_phone`]   = 'Required';
    else if (!/^\d{10}$/.test(m.phone))                    e[`${i}_phone`]   = '10 digits only';
    if (!m.college.trim())                                  e[`${i}_college`] = 'Required';
    return e;
  };

  const validate = () => {
    let e = {};
    members.forEach((m, i) => Object.assign(e, validateMember(m, i)));
    if (!selectedIds.length) e.events = 'Select at least one event';
    if (mode === 'group' && !teamName.trim()) e.teamName = 'Team name is required';
    if (mode === 'group' && members.length < 2) e.members = 'Add at least 2 members for group';
    if (members.length > maxAllowed) e.members = `Selected events allow max ${maxAllowed} member${maxAllowed > 1 ? 's' : ''}`;
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
          api.post('/register', { ...m, eventIds: selectedIds })
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
      // Redirect user to PhonePe's hosted payment page
      window.location.href = res.data.data.redirectUrl;
    } catch (err) {
      alert(err.response?.data?.message || 'Could not initiate payment.');
      setPaying(false);
    }
  };

  /* ── Member helpers ── */
  const updateMember = (i, key, val) =>
    setMembers((p) => p.map((m, idx) => idx === i ? { ...m, [key]: val } : m));
  const addMember    = () => members.length < maxAllowed && setMembers((p) => [...p, { ...EMPTY_MEMBER }]);
  const removeMember = (i) => setMembers((p) => p.filter((_, idx) => idx !== i));

  const iconMap = {
    'Quiz Competition':            '🧠',
    'GeoTalk':                     '🎤',
    'Connecting the Dots':         '🔗',
    'Project Display Competition': '🏗️',
    'MIDAS Workshop':              '💻',
    // legacy
    'Paper Presentation':          '📄',
    'Poster Presentation':         '🎨',
    'Field Mapping':               '🗺️',
    'Rock Identification':         '🪨',
  };

  return (
    <div className="pt-14 sm:pt-16 min-h-screen text-white overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            <span className="shimmer-text">Register</span>
          </h1>
          <p className="text-gray-400 text-sm">Fill in your details and select the events you want to join.</p>
        </motion.div>

        {!registered ? (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Mode Toggle */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass rounded-2xl p-1.5 flex gap-2">
              {['individual', 'group'].map((m) => (
                <button type="button" key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${
                    mode === m
                      ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}>
                  {m === 'individual' ? '🧑‍🎓 Individual' : '👥 Group (2–4)'}
                </button>
              ))}
            </motion.div>

            {errors.api && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
                {errors.api}
              </div>
            )}

            {/* Team name */}
            <AnimatePresence>
              {mode === 'group' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}>
                  <label className="text-xs text-gray-400 mb-1 block">Team Name</label>
                  <input className={inputCls(errors.teamName)} placeholder="e.g. The Rock Stars"
                    value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                  {errors.teamName && <p className="text-red-400 text-xs mt-1">{errors.teamName}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Member forms */}
            <AnimatePresence>
              {members.map((m, i) => (
                <MemberForm key={i} member={m} idx={i + 1} isLeader={i === 0}
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

            {mode === 'group' && members.length < maxAllowed && (
              <motion.button type="button" onClick={addMember}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="w-full glass border border-dashed border-amber-600 rounded-2xl py-3 text-amber-400 hover:text-amber-300 text-sm font-semibold transition">
                + Add Team Member ({members.length}/{maxAllowed})
              </motion.button>
            )}
            {errors.members && <p className="text-red-400 text-xs">{errors.members}</p>}

            {/* Events */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-3 block">
                Select Events
                {mode === 'group' && (
                  <span className="text-gray-500 font-normal text-xs ml-2">(shared for all members)</span>
                )}
              </label>
              <div className="space-y-2">
                {events.map((ev) => (
                  <motion.label key={ev.id} whileHover={{ scale: 1.01 }}
                    className={`flex items-center gap-3 rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer transition-all border ${
                      selectedIds.includes(ev.id)
                        ? 'border-amber-500 bg-amber-600/15'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}>
                    <input type="checkbox" checked={selectedIds.includes(ev.id)}
                      onChange={() => toggleEvent(ev.id)} className="accent-amber-500 w-4 h-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{iconMap[ev.title] || '🌍'} {ev.title}</span>
                      <span className="ml-2 text-[10px] text-emerald-400">
                        {ev.max_members === 1 ? '· Individual only' : ev.max_members === 4 ? '· 4 members' : `· Max ${ev.max_members}`}
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold text-sm shrink-0">₹{ev.price}</span>
                  </motion.label>
                ))}
              </div>
              {errors.events && <p className="text-red-400 text-xs mt-2">{errors.events}</p>}
            </div>

            {/* Total */}
            {selectedIds.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-xl px-5 py-4 flex justify-between items-center">
                <div className="text-sm text-gray-400">
                  Total
                  {mode === 'group' && (
                    <span className="ml-1 text-xs text-gray-500">
                      ({members.length} × ₹{Math.round(totalPrice / members.length)})
                    </span>
                  )}
                </div>
                <div className="text-2xl font-extrabold text-amber-400">₹{totalPrice}</div>
              </motion.div>
            )}

            <motion.button type="submit" disabled={submitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transition disabled:opacity-60">
              {submitting ? 'Registering...' : `Register ${mode === 'group' ? 'Team' : 'Now'} →`}
            </motion.button>
          </form>

        ) : (
          /* ── Payment step ── */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl p-5 sm:p-8 text-center">
            <motion.div animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: 2, duration: 0.4 }} className="text-5xl sm:text-6xl mb-4">
              🎉
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-extrabold mb-2 px-2">
              {mode === 'group' ? `Team "${teamName}" Registered!` : 'Registration Saved!'}
            </h3>
            <p className="text-gray-400 text-sm mb-6 px-2">
              {mode === 'group'
                ? `${members.length} members registered. Complete payment to confirm all spots.`
                : 'Complete your payment to confirm your spot at GeoFest 2026.'}
            </p>
            <div className="glass rounded-xl px-4 sm:px-6 py-4 mb-6">
              <p className="text-gray-500 text-xs mb-1">Total Amount</p>
              <p className="text-3xl sm:text-4xl font-extrabold shimmer-text">₹{totalPrice}</p>
            </div>
            <motion.button onClick={handlePayment} disabled={paying}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/20 transition disabled:opacity-60">
              {paying ? 'Opening Payment...' : '💳 Pay Now & Confirm Spot'}
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
