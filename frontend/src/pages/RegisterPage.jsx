import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

/* ─── Static maps ─── */
const EMPTY_MEMBER = { name: '', email: '', phone: '', college: '', participant_type: '', course: '' };

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

const SCHEDULE = [
  {
    day: 'Day 1', date: '17 March 2026',
    color: 'from-amber-600 to-amber-700',
    items: [
      { time: '09:30 AM – 12:30 PM', label: 'Inauguration Programme & Key Note Sessions' },
      { time: '12:30 PM – 01:30 PM', label: 'Lunch Break' },
      { time: '01:30 PM – 04:00 PM', label: 'Quiz Competition & Midas Software Workshop' },
      { time: '04:00 PM – 04:20 PM', label: 'Refreshment Break' },
      { time: '04:20 PM – 05:00 PM', label: 'Project Evaluation' },
      { time: '09:30 AM – 05:00 PM', label: 'Project Display (Whole Day)' },
    ],
  },
  {
    day: 'Day 2', date: '18 March 2026',
    color: 'from-emerald-600 to-teal-600',
    items: [
      { time: '09:30 AM – 12:30 PM', label: 'First Round: Connecting The Dots & Geotalk' },
      { time: '12:30 PM – 01:30 PM', label: 'Lunch Break' },
      { time: '01:30 PM – 04:00 PM', label: 'Final Round: Connecting The Dots & Geotalk' },
      { time: '04:00 PM – 04:20 PM', label: 'Refreshment Break' },
      { time: '04:20 PM – 05:00 PM', label: 'Valedictory Function' },
      { time: '09:30 AM – 05:00 PM', label: 'Project Display (Whole Day)' },
    ],
  },
];

/* ─── Single participant block ─── */
function MemberForm({ member, idx, onChange, onRemove, removable = true, errors = {} }) {
  const topFields = [
    { key: 'name',    label: 'Full Name',           placeholder: 'Arjun Kumar',              type: 'text'  },
    { key: 'email',   label: 'Email',                placeholder: 'arjun@email.com',          type: 'email' },
    { key: 'phone',   label: 'Phone',                placeholder: '10-digit number',          type: 'text'  },
    { key: 'college', label: 'College / University', placeholder: 'NICMAR University',        type: 'text'  },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="glass rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-amber-400">
          👤 Participant {idx}
        </span>
        {idx > 1 && removable && (
          <button type="button" onClick={onRemove}
            className="text-red-400 hover:text-red-300 text-xs transition">
            ✕ Remove
          </button>
        )}
      </div>

      {/* Name, Email, Phone, College */}
      {topFields.map(({ key, label, placeholder, type }) => (
        <div key={key}>
          <label className="text-xs text-gray-400 mb-1 block">{label}</label>
          <input type={type} className={inputCls(errors[key])}
            placeholder={placeholder} value={member[key]}
            onChange={(e) => onChange(key, e.target.value)} />
          {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
        </div>
      ))}

      {/* Student / Professional toggle */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Participant Type</label>
        <div className="grid grid-cols-2 gap-2">
          {['Student', 'Professional'].map((opt) => {
            const active = member.participant_type === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange('participant_type', opt)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
                  ${active
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-gray-400 hover:border-slate-500 hover:text-gray-200'
                  }`}>
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${active ? 'border-amber-400 bg-amber-400' : 'border-gray-600'}`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {errors.participant_type && (
          <p className="text-red-400 text-xs mt-1">{errors.participant_type}</p>
        )}
      </div>

      {/* Course */}
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Course</label>
        <input type="text" className={inputCls(errors.course)}
          placeholder="e.g. B.Tech Civil, MBA…"
          value={member.course}
          onChange={(e) => onChange('course', e.target.value)} />
        {errors.course && <p className="text-red-400 text-xs mt-1">{errors.course}</p>}
      </div>
    </motion.div>
  );
}

/* ─── Event tile (slot events) ─── */
function EventTile({ ev, index, isSelected, isBlocked, onClick }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
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

      <div className="mt-3 flex items-center gap-2">
        {/* Details — first, before the icons */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/events?tab=gallery&eventId=${ev.id}`);
          }}
          className="text-[11px] font-semibold text-gray-500 hover:text-amber-400 transition-all duration-200
                     px-2.5 py-0.5 rounded-full border border-slate-700/60 hover:border-amber-500/30
                     hover:bg-amber-500/5 shrink-0">
          Details
        </button>

        <div className="flex-1" />

        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
          {indOnly ? 'Individual' : title === 'Connecting The Dots' ? 'Exactly 3' : `Upto ${ev.max_members}`}
        </span>
        <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full border shrink-0
          ${isSelected
            ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
            : 'bg-amber-600/20 border-amber-500/30 text-amber-300'
          }`}>
          ₹{ev.price}
        </span>
      </div>

      {/* GeoTalk — abstract template download */}
      {title === 'Geotalk' && (
        <a
          href="/utils/abstract_template.docx"
          download="GeoTalk_Abstract_Template.docx"
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                     text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-all duration-200
                     border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/5">
          ⬇ Download Abstract Template
        </a>
      )}
    </motion.div>
  );
}

/* ─── Featured Project Display Card ─── */
function FeaturedCard({ ev, onRegister }) {
  const navigate = useNavigate();
  const logo = getLogo(ev.title);

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

      {/* "2-Day Flagship Event" heading */}
      <div className="text-center mb-6">
        <span
          className="inline-block text-xl sm:text-2xl font-extrabold tracking-wide px-8 py-2.5 rounded-full
                     text-amber-400 border-2 border-amber-400/70
                     shadow-[0_0_24px_rgba(251,191,36,0.45),0_0_60px_rgba(251,191,36,0.15)]
                     bg-amber-500/5"
          style={{ textShadow: '0 0 20px rgba(251,191,36,0.7), 0 0 40px rgba(251,191,36,0.3)' }}>
          2-Day Flagship Event
        </span>
      </div>

      {/* Card */}
      <div
        className="relative rounded-2xl border-2 border-amber-400/80 p-6 sm:p-8
                   bg-gradient-to-br from-slate-900 via-amber-950/10 to-slate-900
                   shadow-[0_0_50px_rgba(251,191,36,0.2),0_0_100px_rgba(251,191,36,0.08),0_8px_32px_rgba(0,0,0,0.5)]">

        {/* Flagship badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5
                        bg-gradient-to-r from-amber-500 to-yellow-400 text-black
                        text-xs font-extrabold px-3 py-1.5 rounded-full
                        shadow-[0_2px_12px_rgba(251,191,36,0.5)]">
          🏆 Flagship Event
        </div>

        {/* Featured label */}
        <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-3">
          ⭐ Featured Event
        </p>

        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Logo */}
          {logo && (
            <div className="h-20 sm:h-28 shrink-0 flex items-center">
              <img src={logo} alt="Project Display" className="h-full w-auto object-contain drop-shadow-[0_0_12px_rgba(251,191,36,0.4)]" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1"
                style={{ textShadow: '0 0 30px rgba(251,191,36,0.2)' }}>
              🏆 Project Display
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              {ev.description || 'Showcase your innovative projects to expert judges and peers across both days of GeoFest 2026. An unmissable platform for builders and innovators.'}
            </p>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full">
                🗓 Runs throughout Day 1 &amp; Day 2
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                ⏳ Full-Day Exhibition &amp; Evaluation
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                🟢 Register alongside other slot events
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                👥 Upto {ev.max_members} members
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-amber-300 bg-amber-600/20 border border-amber-500/40 px-3 py-1 rounded-full">
                ₹{ev.price}
              </span>
            </div>

            {/* Buttons row */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                onClick={() => navigate(`/events?tab=gallery&eventId=${ev.id}`)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-5 py-4 text-sm font-semibold rounded-xl
                           border border-slate-600 hover:border-amber-500/50
                           text-gray-400 hover:text-amber-400
                           bg-slate-800/60 hover:bg-amber-500/5
                           transition-all duration-200">
                Details
              </motion.button>

              <motion.button
                onClick={() => onRegister(ev)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-10 py-4 text-base font-extrabold rounded-xl
                           bg-gradient-to-r from-amber-500 to-yellow-400 text-black
                           shadow-[0_4px_20px_rgba(251,191,36,0.45)]
                           hover:shadow-[0_4px_32px_rgba(251,191,36,0.65)]
                           transition-all duration-200">
                Register for Project Display →
              </motion.button>
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-xs text-center mt-6 pt-4 border-t border-slate-700/50">
          This event runs for both days and does not clash with slot-based events.
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Day section ─── */
function DaySection({ dayLabel, date, events, selectedEvent, conflictTitle, onSelect }) {
  if (!events.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-lg sm:text-xl font-extrabold text-amber-400">🗓 {dayLabel}</span>
          <span className="text-base sm:text-lg font-bold text-white">— {date}</span>
          <span className="text-sm text-gray-400 font-medium ml-1">(Choose One)</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
      </div>

      {/* Warning banner */}
      <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/25 rounded-xl px-4 py-3 mb-4">
        <span className="text-base shrink-0 mt-0.5">⚠️</span>
        <p className="text-xs text-amber-300 font-semibold leading-relaxed">
          These events are conducted simultaneously. You can only register for one event in this slot.
        </p>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map((ev, i) => (
          <EventTile
            key={ev.id}
            ev={ev}
            index={i}
            isSelected={selectedEvent?.id === ev.id}
            isBlocked={selectedEvent?.id !== ev.id && conflictTitle === norm(ev.title)}
            onClick={onSelect}
          />
        ))}
      </div>

      <p className="text-center text-xs text-red-400/80 mt-3 font-semibold tracking-wide">
        🛑 Register for only one event in this slot.
      </p>
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
  const [userIds, setUserIds]     = useState(null);
  const [registered, setReg]      = useState(false);

  /* Payment flow state */
  const [projectCategory, setProjectCategory]       = useState('');
  const [projectCategoryOther, setProjectCatOther] = useState('');

  /* Payment flow state */
  const [payInitLoading, setPayInitLoading] = useState(false);
  const [paymentData, setPaymentData]       = useState(null);
  const [utr, setUtr]                       = useState('');
  const [screenshot, setScreenshot]         = useState(null);
  const [screenshotPreview, setScPreview]   = useState('');
  const [paySubmitting, setPaySubmitting]   = useState(false);
  const [payError, setPayError]             = useState('');
  const [payDone, setPayDone]               = useState(false);
  const fileRef = useRef(null);

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

  /* Categorise events */
  const projectDisplay = events.find(ev => norm(ev.title) === 'Project Display');
  const day1Events = events.filter(ev => {
    const n = norm(ev.title);
    return n === 'Quiz Competition' || n === 'Midas Software Workshop';
  });
  const day2Events = events.filter(ev => {
    const n = norm(ev.title);
    return n === 'Connecting The Dots' || n === 'Geotalk';
  });

  const maxAllowed    = selectedEvent?.max_members ?? 4;
  const minAllowed    = norm(selectedEvent?.title) === 'Connecting The Dots' ? 3 : 1;
  const conflictTitle = selectedEvent ? getConflict(selectedEvent.title) : null;
  const totalPrice    = selectedEvent ? parseFloat(selectedEvent.price) : 0;

  const closeModal = () => {
    setSelEv(null); setReg(false); setUserIds(null); setPaymentData(null);
    setUtr(''); setScreenshot(null); setScPreview(''); setPayError(''); setPayDone(false);
    setProjectCategory(''); setProjectCatOther('');
  };

  const selectEvent = (ev) => {
    if (selectedEvent?.id === ev.id) { closeModal(); return; }
    setSelEv(ev);
    const initCount = norm(ev.title) === 'Connecting The Dots' ? 3 : 1;
    setMembers(Array.from({ length: initCount }, () => ({ ...EMPTY_MEMBER })));
    setErrors({});
    setReg(false);
    setUserIds(null);
    setPaymentData(null);
    setPayDone(false);
    setProjectCategory(''); setProjectCatOther('');
  };

  const validate = () => {
    const e = {};
    members.forEach((m, i) => {
      if (!m.name.trim())                                    e[`${i}_name`]    = 'Required';
      if (!m.email.trim())                                   e[`${i}_email`]   = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) e[`${i}_email`]   = 'Invalid email';
      if (!m.phone.trim())                                   e[`${i}_phone`]   = 'Required';
      else if (!/^\d{10}$/.test(m.phone))                   e[`${i}_phone`]   = '10 digits only';
      if (!m.college.trim())                                 e[`${i}_college`]           = 'Required';
      if (!m.participant_type)                               e[`${i}_participant_type`]  = 'Please select one';
      if (!m.course.trim())                                  e[`${i}_course`]            = 'Required';
    });
    if (norm(selectedEvent?.title) === 'Project Display') {
      if (!projectCategory)                                  e.project_category       = 'Please select a category';
      if (projectCategory === 'Other' && !projectCategoryOther.trim())
                                                             e.project_category_other = 'Please describe your category';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({}); setSub(true);
    try {
      const categoryValue = projectCategory === 'Other' ? projectCategoryOther : projectCategory;
      const ids = await Promise.all(
        members.map((m) =>
          api.post('/register', {
            ...m,
            ...(norm(selectedEvent.title) === 'Project Display' && { project_category: categoryValue }),
            eventIds: [selectedEvent.id],
          }).then((r) => r.data.data.user.id)
        )
      );
      setUserIds(ids);
      setReg(true);
    } catch (err) {
      setErrors({ api: err.response?.data?.message || 'Registration failed. Try again.' });
    } finally { setSub(false); }
  };

  const handleInitiatePayment = async () => {
    setPayInitLoading(true); setPayError('');
    try {
      const res = await api.post('/payment/initiate', { userIds });
      setPaymentData(res.data.data);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Could not generate payment QR. Please try again.');
    } finally { setPayInitLoading(false); }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshot(file); setScPreview(URL.createObjectURL(file)); setPayError('');
  };

  const handleSubmitPayment = async () => {
    if (!utr.trim()) { setPayError('Please enter the UTR / Transaction ID.'); return; }
    if (!screenshot) { setPayError('Please upload your payment screenshot.'); return; }
    setPaySubmitting(true); setPayError('');
    try {
      const form = new FormData();
      form.append('referenceId', paymentData.referenceId);
      form.append('utr', utr.trim());
      form.append('screenshot', screenshot);
      await api.post('/payment/submit', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPayDone(true);
    } catch (err) {
      setPayError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setPaySubmitting(false); }
  };

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
            Click on an event card to register — fill your details and pay to confirm your spot.
          </p>
        </motion.div>
      </div>

      {/* ── Schedule ── */}
      <section className="py-10 sm:py-14 px-4 bg-black/40">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Event <span className="shimmer-text">Schedule</span></h2>
            <p className="text-white font-bold text-sm sm:text-base">Two days of engineering excellence — 17 & 18 March 2026</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {SCHEDULE.map((day, i) => (
              <motion.div key={day.day}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <div className={`rounded-t-2xl bg-gradient-to-r ${day.color} px-5 sm:px-6 py-3 sm:py-4`}>
                  <h3 className="text-lg sm:text-xl font-extrabold">{day.day}</h3>
                  <p className="text-white/80 text-sm">{day.date}</p>
                </div>
                <div className="glass rounded-b-2xl p-4 space-y-3">
                  {day.items.map((item, j) => (
                    <div key={j} className="flex items-start gap-3">
                      <span className="text-xs sm:text-sm text-white w-28 sm:w-44 shrink-0 mt-0.5 font-mono font-bold">{item.time}</span>
                      <span className="text-sm sm:text-base text-gray-200 leading-relaxed">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {loading ? (
          <div className="space-y-8">
            <div className="h-56 rounded-2xl bg-slate-800 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* ── Featured: Project Display ── */}
            {projectDisplay && (
              <FeaturedCard ev={projectDisplay} onRegister={selectEvent} />
            )}

            {/* ── Day 1 ── */}
            <DaySection
              dayLabel="DAY 1"
              date="17th March"
              events={day1Events}
              selectedEvent={selectedEvent}
              conflictTitle={conflictTitle}
              onSelect={selectEvent}
            />

            {/* ── Day 2 ── */}
            <DaySection
              dayLabel="DAY 2"
              date="18th March"
              events={day2Events}
              selectedEvent={selectedEvent}
              conflictTitle={conflictTitle}
              onSelect={selectEvent}
            />
          </>
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
                      {maxAllowed === 1 ? 'Individual only' : norm(selectedEvent.title) === 'Connecting The Dots' ? 'Exactly 3 participants' : `Upto ${maxAllowed} participants`}
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
                  {!registered && (
                    <form onSubmit={handleSubmit} className="space-y-4">

                      {errors.api && (
                        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
                          {errors.api}
                        </div>
                      )}

                      {/* GeoTalk — abstract submission notice */}
                      {norm(selectedEvent.title) === 'Geotalk' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-blue-500/40 bg-blue-500/8 px-4 py-3.5 space-y-1.5">
                          <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
                            📄 Abstract Submission Info
                          </p>
                          <p className="text-xs text-blue-200 leading-relaxed">
                            ✉️ &nbsp;The abstract template will be sent via email.
                          </p>
                          <p className="text-xs text-blue-200 leading-relaxed">
                            📅 &nbsp;Last date for submission of abstract is <span className="font-bold text-white">13th March 2026</span>.
                          </p>
                          <p className="text-xs text-blue-200 leading-relaxed">
                            📬 &nbsp;Submit your abstract to:&nbsp;
                            <a href="mailto:Igssc@pune.nicmar.ac.in"
                              className="font-bold text-amber-300 hover:text-amber-200 underline underline-offset-2 transition">
                              Igssc@pune.nicmar.ac.in
                            </a>
                          </p>
                        </motion.div>
                      )}

                      <AnimatePresence>
                        {members.map((m, i) => (
                          <MemberForm key={i} member={m} idx={i + 1}
                            onChange={(key, val) => updateMember(i, key, val)}
                            onRemove={() => removeMember(i)}
                            removable={members.length > minAllowed}
                            errors={Object.fromEntries(
                              Object.entries(errors)
                                .filter(([k]) => k.startsWith(`${i}_`))
                                .map(([k, v]) => [k.replace(`${i}_`, ''), v])
                            )}
                          />
                        ))}
                      </AnimatePresence>

                      {/* Project Submission Category — Project Display only */}
                      {norm(selectedEvent.title) === 'Project Display' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className="glass rounded-2xl p-5 space-y-3">
                          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
                            Project Submission Category
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {['Prototype', 'Model', 'Case study', 'Other'].map((cat) => {
                              const active = projectCategory === cat;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => { setProjectCategory(cat); setErrors((p) => ({ ...p, project_category: undefined, project_category_other: undefined })); }}
                                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200
                                    ${active
                                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                                      : 'bg-slate-800 border-slate-700 text-gray-400 hover:border-slate-500 hover:text-gray-200'
                                    }`}>
                                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                    ${active ? 'border-amber-400 bg-amber-400' : 'border-gray-600'}`}>
                                    {active && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                                  </span>
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                          {errors.project_category && (
                            <p className="text-red-400 text-xs mt-1">{errors.project_category}</p>
                          )}
                          {projectCategory === 'Other' && (
                            <div>
                              <label className="text-xs text-gray-400 mb-1 block">Please specify</label>
                              <input
                                type="text"
                                className={inputCls(errors.project_category_other)}
                                placeholder="Describe your project type..."
                                value={projectCategoryOther}
                                onChange={(e) => setProjectCatOther(e.target.value)}
                              />
                              {errors.project_category_other && (
                                <p className="text-red-400 text-xs mt-1">{errors.project_category_other}</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {maxAllowed > 1 && members.length < maxAllowed && minAllowed < maxAllowed && (
                        <motion.button type="button" onClick={addMember}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full bg-slate-800 border border-dashed border-amber-600 rounded-2xl py-3
                                     text-amber-400 hover:text-amber-300 text-sm font-semibold transition">
                          + Add Participant ({members.length}/{maxAllowed})
                        </motion.button>
                      )}

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

                      {/* Mail notice — all events */}
                      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3">
                        <span className="text-base shrink-0 mt-0.5">📧</span>
                        <p className="text-xs text-amber-300 font-semibold leading-relaxed">
                          All the details and rulebook of the registered event will be shared via email after registration.
                        </p>
                      </div>

                      <motion.button type="submit" disabled={submitting}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold
                                   rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40
                                   transition disabled:opacity-60 text-base">
                        {submitting ? 'Registering...' : 'Register Now →'}
                      </motion.button>
                    </form>
                  )}

                  {/* STEP 2 — Registration saved, initiate payment */}
                  {registered && !paymentData && !payDone && (
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
                        Complete payment via UPI to confirm {members.length > 1 ? 'all spots' : 'your spot'}.
                      </p>
                      <div className="bg-slate-800 rounded-xl px-5 py-4 mb-5">
                        <p className="text-gray-500 text-xs mb-1">Amount to Pay</p>
                        <p className="text-3xl font-extrabold shimmer-text">Rs.199</p>
                      </div>
                      {payError && <p className="text-red-400 text-sm mb-3">{payError}</p>}
                      <motion.button onClick={handleInitiatePayment} disabled={payInitLoading}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold
                                   rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-60">
                        {payInitLoading ? 'Generating QR Code...' : 'Pay Now & Confirm Spot'}
                      </motion.button>
                    </motion.div>
                  )}

                  {/* STEP 3 — QR + UPI info + UTR submission */}
                  {registered && paymentData && !payDone && (
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                      <div className="bg-slate-800 rounded-2xl p-5 text-center border border-slate-700/60">
                        <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mb-3">Scan QR to Pay</p>
                        <div className="flex justify-center mb-3">
                          <img src={paymentData.qrCodeBase64} alt="UPI QR Code" className="w-52 h-52 rounded-xl border-4 border-white" />
                        </div>
                        <div className="text-3xl font-extrabold text-amber-400 mb-1">Rs.{paymentData.amount}</div>
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <span className="text-gray-400 text-xs">UPI ID:</span>
                          <span className="text-white font-mono font-semibold text-sm">{paymentData.upiId}</span>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
                          <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest mb-1">
                            Your Reference ID — note this down!
                          </p>
                          <p className="text-xl font-extrabold text-amber-300 tracking-widest font-mono">{paymentData.referenceId}</p>
                        </div>
                        <a href={paymentData.upiLink}
                          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl text-sm shadow-lg hover:opacity-90 transition">
                          Pay via UPI App (mobile)
                        </a>
                        <p className="text-gray-600 text-[10px] mt-2">Opens your UPI app automatically on mobile</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-xs text-gray-500 font-semibold">After paying, submit proof below</span>
                        <div className="flex-1 h-px bg-slate-700" />
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block font-semibold">
                            UPI Reference / Transaction ID (UTR) *
                          </label>
                          <input type="text" value={utr}
                            onChange={(e) => { setUtr(e.target.value); setPayError(''); }}
                            placeholder="e.g. 407919767984"
                            className={`w-full bg-slate-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 transition ${payError && !utr.trim() ? 'border-red-500' : 'border-slate-700'}`}
                            maxLength={30} />
                          <p className="text-gray-600 text-[10px] mt-1">Find this in your UPI app under transaction history</p>
                        </div>

                        <div>
                          <label className="text-xs text-gray-400 mb-1.5 block font-semibold">Payment Screenshot *</label>
                          <div onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer transition-colors">
                            {screenshotPreview
                              ? <img src={screenshotPreview} alt="preview" className="max-h-36 mx-auto rounded-lg object-contain" />
                              : <>
                                  <div className="text-3xl mb-1">📸</div>
                                  <p className="text-gray-400 text-xs">Click to upload screenshot</p>
                                  <p className="text-gray-600 text-[10px] mt-0.5">JPG, JPEG, PNG — Max 5 MB</p>
                                </>
                            }
                          </div>
                          <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png" onChange={handleScreenshotChange} className="hidden" />
                        </div>

                        {payError && (
                          <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">{payError}</div>
                        )}

                        <motion.button onClick={handleSubmitPayment} disabled={paySubmitting}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-60">
                          {paySubmitting ? 'Submitting...' : 'Submit Payment Proof'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4 — Confirmation */}
                  {payDone && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="text-6xl mb-5">
                        ✅
                      </motion.div>
                      <h3 className="text-xl font-extrabold mb-2 text-emerald-400">Payment Submitted!</h3>
                      <p className="text-gray-400 text-sm mb-4">
                        We will verify your payment and confirm your spot within <strong className="text-white">24 hours</strong>.
                      </p>
                      <div className="bg-slate-800 rounded-xl px-5 py-4 mb-5 text-left">
                        <p className="text-xs text-gray-500 mb-1">Reference ID</p>
                        <p className="text-amber-300 font-mono font-bold tracking-widest text-lg">{paymentData?.referenceId}</p>
                        <p className="text-[10px] text-gray-600 mt-2">
                          Save this for your records. You will receive a confirmation email once verified.
                        </p>
                      </div>
                      <motion.button onClick={closeModal} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition text-sm">
                        Close
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
