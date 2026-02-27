import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ── Countdown ── */
const EVENT_DATE = new Date('2026-03-17T09:00:00');

function useCountdown() {
  const calc = () => {
    const diff = EVENT_DATE - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => { const t = setInterval(() => setTime(calc()), 1000); return () => clearInterval(t); }, []);
  return time;
}

/* ── Animated counter ── */
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 60);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 24);
    return () => clearInterval(t);
  }, [target]);
  return <span>{val}{suffix}</span>;
}

/* ── Floating particle ── */
function Particle({ cls, emoji, x, y }) {
  return (
    <div className={`absolute text-xl sm:text-2xl opacity-20 select-none pointer-events-none ${cls}`}
         style={{ left: x, top: y }}>
      {emoji}
    </div>
  );
}

const PARTICLES = [
  { emoji: '🪨', x: '8%',  y: '20%', cls: 'float-1' },
  { emoji: '🔬', x: '85%', y: '15%', cls: 'float-2' },
  { emoji: '⛏️', x: '15%', y: '70%', cls: 'float-3' },
  { emoji: '🌋', x: '78%', y: '65%', cls: 'float-4' },
  { emoji: '🧭', x: '50%', y: '10%', cls: 'float-2' },
  { emoji: '💎', x: '92%', y: '45%', cls: 'float-1' },
];

const STATS = [
  { label: 'Students Expected', target: 700,   suffix: '+' },
  { label: 'Colleges',          target: 125,   suffix: '+' },
  { label: 'Events',            target: 5,     suffix: '' },
  { label: 'Prize Pool (₹)',    target: 65000, suffix: '+' },
];

const MODES = [
  { icon: '🧑‍🎓', title: 'Individual', desc: 'Compete solo. Demonstrate your knowledge in geotechnical & civil engineering.', path: '/register?mode=individual', color: 'from-amber-500 to-amber-700' },
  { icon: '👥', title: 'Team',        desc: 'Register as a team of 2–4. Collaborate, compete and conquer together.',         path: '/register?mode=group',       color: 'from-emerald-500 to-teal-600' },
];

const EVENTS_PREVIEW = [
  { emoji: '🧠', title: 'Quiz Competition',             price: 199, members: 'Max 2 members',     desc: 'Inter-college geoscience & geotechnical engineering quiz.' },
  { emoji: '🔗', title: 'Connecting the Dots',          price: 199, members: 'Max 3 members',     desc: 'Solve real-world geotechnical problems by connecting multi-disciplinary concepts.' },
  { emoji: '🎤', title: 'Geotalk (Paper Presentation)', price: 199, members: 'Max 2 members',     desc: 'Present your research paper or innovative idea in geotechnical / civil engineering.' },
  { emoji: '🏗️', title: 'Project Display',              price: 199, members: 'Exactly 4 members', desc: 'Showcase your engineering project or working model. Team of exactly 4.' },
  { emoji: '💻', title: 'Midas Software Workshop',      price: 199, members: 'Individual only',   desc: 'Hands-on training on MIDAS geotechnical software.' },
];

const OBJECTIVES = [
  { icon: '🌍', text: 'Promote geotechnical engineering awareness' },
  { icon: '💡', text: 'Encourage innovation and research' },
  { icon: '🧩', text: 'Develop analytical and problem-solving skills' },
  { icon: '🏛️', text: 'Provide academic and industry exposure' },
  { icon: '🤝', text: 'Strengthen technical collaboration among students' },
];

const SCHEDULE = [
  {
    day: 'Day 1', date: '17 March 2026',
    color: 'from-amber-600 to-amber-700',
    items: [
      { time: '9:00 AM',   label: 'Inauguration Programme' },
      { time: '10:30 AM',  label: 'Quiz Competition' },
      { time: '10:30 AM',  label: 'Midas Software Workshop' },
      { time: '10:00 AM',  label: 'Project Display Competition (All Day)' },
      { time: '2:30 PM',   label: 'Project Evaluation & Results' },
    ],
  },
  {
    day: 'Day 2', date: '18 March 2026',
    color: 'from-emerald-600 to-teal-600',
    items: [
      { time: '9:30 AM',   label: 'Connecting the Dots Competition' },
      { time: '11:00 AM',  label: 'Geotalk (Paper Presentation)' },
      { time: '10:00 AM',  label: 'Project Display Competition (All Day)' },
      { time: '4:30 PM',   label: 'Valedictory Function' },
    ],
  },
];

const FACULTY_ADVISORS = [
  { name: 'Dr. Smita K. Patil',  role: 'Dean, School of Engineering',        initials: 'SP', photo: '/geofest_faculty_photos/Dr_Smita_K_Patil.jpg' },
  { name: 'Dr. Vidya Khanapure', role: 'Faculty Advisor, IGS Student Chapter', initials: 'VK', photo: '/geofest_faculty_photos/Dr_Vidya_Khanapure.jpg' },
];

const FACULTY_COORDINATORS = [
  { name: 'Dr. Aniket V. Dahasahastra',    initials: 'AD', photo: '/geofest_faculty_photos/Dr_Aniket_V_Dahasahastra.jpg' },
  { name: 'Dr. Ramala Rakesh Kumar Reddy', initials: 'RR', photo: '/geofest_faculty_photos/Dr_Ramala_Rakesh_Kumar_Reddy.jpg' },
  { name: 'Dr. Vijendra Kumar',            initials: 'VK', photo: '/geofest_faculty_photos/Dr_Vijendra_Kumar.jpg' },
  { name: 'Dr. Dinesh S. Aswar',           initials: 'DA', photo: '/geofest_faculty_photos/Dr_Dinesh_S_Aswar.jpg' },
  { name: 'Dr. Dyana Joseline',            initials: 'DJ', photo: '/geofest_faculty_photos/Dr_Dyana_Joseline.jpg' },
  { name: 'Dr. Vidya Khanapure',           initials: 'VK', photo: '/geofest_faculty_photos/Dr_Vidya_Khanapure.jpg' },
  { name: 'Dr. Mohammed Maaze',            initials: 'MM', photo: null },
  { name: 'Dr. Shashank B. S',             initials: 'SS', photo: '/geofest_faculty_photos/Dr_Shashank_B_S.jpg' },
  { name: 'Dr. S. Senthamizh Sankar',      initials: 'SS', photo: '/geofest_faculty_photos/Dr_S_Senthamizh_Sankar.jpg' },
];

const OFFICE_BEARERS = [
  { name: 'Aman Bagwan',               role: 'President',     icon: '👑' },
  { name: 'Rajnandini Sanjay Mundhe',  role: 'Vice President', icon: '🌟' },
  { name: 'Jiskar Yogendra Prabhakar', role: 'Treasurer',      icon: '💰' },
];

const SUPPORTING_ROLES = [
  { name: 'Sheikh Faaez Ahmed',      role: 'Social Media Head' },
  { name: 'Kokane Om Ashok',         role: 'Head Outreach' },
  { name: 'Waghmare Pranav Vaibhav', role: 'Online Events & Training Head' },
];

const CONTACTS = [
  { name: 'Pranav Waghmare',     phone: '+91 70200 16722', role: 'Student Coordinator', icon: '🎓' },
  { name: 'Aman Bagwan',         phone: '+91 77418 82200', role: 'Student Coordinator', icon: '🎓' },
  { name: 'Dr. Shashank B. S',   phone: '+91 99017 29657', role: 'Faculty Contact',     icon: '👨‍🏫' },
  { name: 'Dr. Vidya Khanapure', phone: '+91 88880 67441', role: 'Faculty Contact',     icon: '👨‍🏫' },
];

const fade = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };

export default function LandingPage() {
  const navigate  = useNavigate();
  const countdown = useCountdown();

  return (
    <div className="pt-14 sm:pt-16 text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-16">
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

        <motion.div className="relative z-10 text-center max-w-5xl mx-auto w-full"
          variants={{ show: { transition: { staggerChildren: 0.15 } } }}
          initial="hidden" animate="show">

          {/* College logos */}
          <motion.div variants={fade} className="flex items-center justify-center gap-12 sm:gap-20 mb-6">
            <img src="/NICMAR_LOGO1.jpeg" alt="NICMAR Logo" className="h-12 sm:h-16 md:h-20 w-auto object-contain rounded-2xl shadow-[0_0_24px_6px_rgba(200,200,200,0.3)]" />
            <img src="/NICMARLOGO2.jpeg"  alt="NICMAR Logo 2" className="h-12 sm:h-16 md:h-20 w-auto object-contain rounded-2xl shadow-[0_0_24px_6px_rgba(200,200,200,0.3)]" />
          </motion.div>

          {/* Venue pill */}
          <motion.div variants={fade}
            className="inline-flex flex-wrap justify-center gap-x-2 mb-4 px-5 sm:px-8 py-2.5 rounded-full glass text-amber-300 text-lg sm:text-2xl font-extrabold tracking-wider uppercase">
            <span>NICMAR University, Pune</span>
            <span className="opacity-50">•</span>
            <span>17–18 March 2026</span>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={fade} className="font-black mb-2 tracking-tighter leading-none">
            <span className="shimmer-text text-6xl sm:text-7xl md:text-9xl">GeoFest</span>
            <span className="text-white text-5xl sm:text-7xl md:text-9xl block"> 2026</span>
          </motion.h1>

          {/* Theme */}
          <motion.div variants={fade} className="mb-2">
            <span className="text-2xl sm:text-3xl md:text-5xl font-bold text-amber-300 tracking-widest uppercase">
              STRATA
            </span>
          </motion.div>

          <motion.p variants={fade} className="text-gray-200 text-base sm:text-lg mb-2 max-w-xl mx-auto italic px-2">
            Engineering the Ground Beneath the Future
          </motion.p>

          <motion.p variants={fade} className="text-gray-300 text-xs sm:text-sm mb-8 sm:mb-10 max-w-xl mx-auto px-2">
            National Level Technical & Academic Festival — Indian Geotechnical Society Student Chapter
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fade} className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 px-4 sm:px-0">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xl shadow-amber-500/30 transition">
              Register Now →
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/events')}
              className="w-full sm:w-auto px-8 py-4 glass hover:bg-white/10 text-white font-bold rounded-xl transition">
              View Events
            </motion.button>
          </motion.div>

          {/* Countdown */}
          <motion.div variants={fade}
            className="glass rounded-2xl px-4 sm:px-6 py-4 sm:py-5 inline-flex gap-4 sm:gap-8 mx-auto">
            {[['Days', countdown.days], ['Hrs', countdown.hours], ['Min', countdown.minutes], ['Sec', countdown.seconds]].map(([label, val]) => (
              <div key={label} className="text-center min-w-[40px] sm:min-w-[52px]">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 tabular-nums">
                  {String(val).padStart(2, '0')}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute bottom-6 text-gray-600 text-sm flex flex-col items-center gap-1">
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <span>↓</span>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-black/55 py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {STATS.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center glass rounded-2xl py-6 sm:py-8 px-2 sm:px-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400">
                <Counter target={s.target} suffix={s.suffix} />
              </div>
              <div className="text-gray-400 text-xs sm:text-sm mt-2">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">About <span className="shimmer-text">GeoFest</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-2">
              GeoFest is the flagship technical festival conducted under the Indian Geotechnical Society (IGS)
              Student Chapter at NICMAR University. The festival promotes academic excellence, innovation, and
              practical learning through competitions, workshops, and technical interactions.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {OBJECTIVES.map((obj, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 card-hover">
                <span className="text-xl sm:text-2xl shrink-0">{obj.icon}</span>
                <span className="text-gray-300 text-sm">{obj.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS PREVIEW ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="flex items-center justify-between mb-8 sm:mb-10 flex-wrap gap-3">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold">Events</h2>
              <p className="text-gray-400 mt-1 text-sm">Compete in one or multiple events.</p>
            </div>
            <button onClick={() => navigate('/events')}
              className="text-amber-400 hover:text-amber-300 text-sm font-semibold border border-amber-700 px-4 py-2 rounded-lg hover:border-amber-500 transition whitespace-nowrap">
              View All →
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {EVENTS_PREVIEW.map((ev, i) => (
              <motion.div key={ev.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 sm:p-6 card-hover flex flex-col">
                <div className="text-5xl sm:text-6xl mb-3">{ev.emoji}</div>
                <h3 className="text-base sm:text-lg font-bold mb-1">{ev.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3 leading-relaxed flex-1">{ev.desc}</p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-amber-400 font-bold">₹{ev.price}</span>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{ev.members}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCHEDULE ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Event <span className="shimmer-text">Schedule</span></h2>
            <p className="text-gray-400 text-sm sm:text-base">Two days of engineering excellence — 17 & 18 March 2026</p>
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
                      <span className="text-[11px] text-gray-500 w-16 sm:w-20 shrink-0 mt-0.5">{item.time}</span>
                      <span className="text-sm text-gray-200 leading-relaxed">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTICIPATION MODES ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-12">
          <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-extrabold mb-3">How do you want to compete?</motion.h2>
          <p className="text-gray-400 text-sm sm:text-base">Choose your style — go solo or bring your crew.</p>
        </div>
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {MODES.map((m, i) => (
            <motion.div key={m.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(m.path)}
              className={`cursor-pointer rounded-2xl p-6 sm:p-8 bg-gradient-to-br ${m.color} shadow-xl text-white`}>
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{m.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{m.title} Registration</h3>
              <p className="text-white/80 text-sm leading-relaxed">{m.desc}</p>
              <div className="mt-5 sm:mt-6 text-sm font-semibold underline underline-offset-4 opacity-80">
                Register as {m.title} →
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FACULTY ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3"><span className="shimmer-text">Faculty</span></h2>
            <p className="text-gray-400 text-sm sm:text-base">Guiding minds, shaping engineers.</p>
          </motion.div>

          {/* Advisors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {FACULTY_ADVISORS.map((f, i) => (
              <motion.div key={f.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 sm:p-8 text-center card-hover">
                <div className="w-24 sm:w-28 h-24 sm:h-28 rounded-full mx-auto mb-4 overflow-hidden border-2 border-amber-500/40 shadow-lg shadow-amber-500/20">
                  {f.photo
                    ? <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl font-bold text-white">
                        {f.initials}
                      </div>
                  }
                </div>
                <h3 className="font-bold text-white mb-1 text-base sm:text-lg">{f.name}</h3>
                <p className="text-amber-400 text-xs sm:text-sm">{f.role}</p>
              </motion.div>
            ))}
          </div>

          {/* Coordinators */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-base sm:text-lg font-bold text-gray-300 mb-4 text-center">Faculty Coordinators</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {FACULTY_COORDINATORS.map((f, i) => (
                <motion.div key={f.name}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl p-4 flex flex-col items-center text-center card-hover">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mb-3 overflow-hidden border-2 border-amber-500/30 shadow-md shadow-amber-500/10 flex-shrink-0">
                    {f.photo
                      ? <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg font-bold text-white">
                          {f.initials}
                        </div>
                    }
                  </div>
                  <span className="text-xs sm:text-sm text-gray-300 font-medium leading-snug">{f.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── OFFICE BEARERS ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Office <span className="shimmer-text">Bearers</span></h2>
            <p className="text-gray-400 text-sm sm:text-base">IGS Student Chapter — NICMAR University, Pune</p>
          </motion.div>

          {/* Core team */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
            {OFFICE_BEARERS.map((b, i) => (
              <motion.div key={b.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 sm:p-6 text-center card-hover">
                <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl mx-auto mb-3">
                  {b.icon}
                </div>
                <h3 className="font-bold text-white mb-1 text-sm sm:text-base">{b.name}</h3>
                <p className="text-emerald-400 text-xs">{b.role}</p>
              </motion.div>
            ))}
          </div>

          {/* Supporting roles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {SUPPORTING_ROLES.map((r, i) => (
              <motion.div key={r.name}
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-xl px-4 sm:px-5 py-3 sm:py-4">
                <p className="font-semibold text-sm text-white">{r.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{r.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">Contact <span className="shimmer-text">Us</span></h2>
            <p className="text-gray-400 text-sm sm:text-base">IGS Student Chapter — NICMAR University, Pune</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {CONTACTS.map((c, i) => (
              <motion.div key={c.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 card-hover">
                <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-lg sm:text-xl shrink-0">
                  {c.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{c.name}</p>
                  <p className="text-gray-400 text-xs mb-0.5">{c.role}</p>
                  <a href={`tel:${c.phone.replace(/\s/g, '')}`}
                    className="text-amber-400 hover:text-amber-300 text-sm font-mono transition">
                    {c.phone}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Email */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="glass rounded-2xl p-5 sm:p-6 text-center">
            <p className="text-gray-400 text-sm mb-1">Email us at</p>
            <a href="mailto:Igssc@pune.nicmar.ac.in"
              className="text-amber-400 hover:text-amber-300 text-base sm:text-lg font-semibold transition break-all">
              Igssc@pune.nicmar.ac.in
            </a>
            <p className="text-gray-500 text-xs mt-3">📍 NICMAR University Campus, Pune</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-6 mb-8">
            <img src="/NICMAR_LOGO1.jpeg" alt="NICMAR Logo" className="h-14 sm:h-16 w-auto object-contain" />
            <img src="/NICMARLOGO2.jpeg"  alt="NICMAR Logo 2" className="h-14 sm:h-16 w-auto object-contain" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-4 px-2">
            Ready to <span className="shimmer-text">dig deeper</span>?
          </h2>
          <p className="text-gray-400 mb-1 text-sm sm:text-base">Seats are limited. Register before they fill up.</p>
          <p className="text-gray-500 text-xs sm:text-sm mb-8">17–18 March 2026 • NICMAR University, Pune</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto px-8 sm:px-10 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-base sm:text-lg rounded-xl shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition">
            Register for GeoFest 2026
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
