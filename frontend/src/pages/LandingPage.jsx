import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Countdown ── */
const EVENT_DATE        = new Date('2026-03-17T09:00:00');
const INAUGURATION_DATE = new Date('2026-03-17T09:30:00');

function useCountdown(targetDate) {
  const calc = () => {
    const diff = targetDate - Date.now();
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
  { icon: '🧑‍🎓', title: 'Individual', desc: 'Compete solo. Demonstrate your knowledge in Geotechnical & civil engineering.', path: '/register?mode=individual', color: 'from-amber-500 to-amber-700' },
  { icon: '👥', title: 'Team',        desc: 'Register as a team of 2–4. Collaborate, compete and conquer together.',         path: '/register?mode=group',       color: 'from-emerald-500 to-teal-600' },
];

const EVENTS_PREVIEW = [
  { logo: '/Logos_Events/Quiz.png',       title: 'Quiz Competition',        price: 199, members: 'Upto 2 members',    desc: 'Technical quiz testing Geotechnical knowledge, speed, accuracy, and analytical thinking.' },
  { logo: '/Logos_Events/Connecting.png', title: 'Connecting The Dots',     price: 199, members: 'Exactly 3 members', desc: 'Solve real-world Geotechnical problems by connecting multi-disciplinary concepts.' },
  { logo: '/Logos_Events/GeoTalk.png',    title: 'Geotalk',                 price: 199, members: 'Upto 2 members',    desc: 'Present your research paper or innovative idea in Geotechnical engineering.' },
  { logo: '/Logos_Events/Project.png',    title: 'Project Display',         price: 199, members: 'Upto 5 members', desc: 'Showcase innovative Geotechnical projects, models, prototypes, and engineering solutions.' },
  { logo: '/Logos_Events/Midas.png',      title: 'Midas Software Workshop', price: 199, members: 'Individual only',   desc: 'Expert workshop on MIDAS applications in Geotechnical engineering and design.' },
];

const PRIZE_POOL = {
  'Quiz Competition':    '15,000',
  'Connecting The Dots': '15,000',
  'Geotalk':             '15,000',
  'Project Display':     '22,000',
};

const OBJECTIVES = [
  { logo: '/about%20logos%20geofest/Promote.png',    text: 'Promote Geotechnical engineering awareness' },
  { logo: '/about%20logos%20geofest/Encourage.png',  text: 'Encourage innovation and research' },
  { logo: '/about%20logos%20geofest/Develope.png',   text: 'Develop analytical and problem-solving skills' },
  { logo: '/about%20logos%20geofest/Provide.png',    text: 'Provide academic and industry exposure' },
  { logo: '/about%20logos%20geofest/Strengthen.png', text: 'Strengthen technical collaboration among students' },
];

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
      { time: '09:30 AM – 12:30 PM', label: 'Connecting The Dots & Geotalk' },
      { time: '12:30 PM – 01:30 PM', label: 'Lunch Break' },
      { time: '01:30 PM – 04:00 PM', label: 'Connecting The Dots & Geotalk' },
      { time: '04:00 PM – 04:20 PM', label: 'Refreshment Break' },
      { time: '04:20 PM – 05:00 PM', label: 'Valedictory Function' },
      { time: '09:30 AM – 05:00 PM', label: 'Project Display (Whole Day)' },
    ],
  },
];

const FACULTY_ADVISORS = [
  { name: 'Dr. Smita Krishnarao Patil', role: 'Dean, School of Engineering',                                   initials: 'SP', photo: '/geofest_faculty_photos/Dr_Smita_K_Patil.jpg' },
  { name: 'Dr. Shashank B S',           role: 'Head, B.Tech Civil',                                            initials: 'SB', photo: '/geofest_faculty_photos/Dr_Shashank_B_S.jpg' },
  { name: 'Dr. Vidya Khanapure',        role: 'Head, M.Tech',                                                  initials: 'VK', photo: '/geofest_faculty_photos/Dr_Vidya_Khanapure.jpg' },
  { name: 'Dr. Adinath Damale',         role: 'Controller of Examination, NICMAR University, Pune',            initials: 'AD', photo: '/geofest_faculty_photos/Dr_Adinath_Damale_new001.png' },
];

const FACULTY_COORDINATORS = [
  { name: 'Dr. Dinesh S. Aswar',           initials: 'DA', photo: '/geofest_faculty_photos/Dr_Dinesh_S_Aswar.jpg',             role: 'Assistant Professor, NICMAR University, Pune' },
  { name: 'Dr. Mohammed Rihan Maaze',      initials: 'MM', photo: '/geofest_faculty_photos/Dr._Mohammed_Rihan_Maaze_.jpg',     role: 'Assistant Professor, NICMAR University, Pune' },
  { name: 'Dr. Vijendra Kumar',            initials: 'VK', photo: '/geofest_faculty_photos/Dr_Vijendra_Kumar.jpg',             role: 'Assistant Professor, NICMAR University, Pune' },
  { name: 'Dr. Aniket Dahasahastra',       initials: 'AD', photo: '/geofest_faculty_photos/Dr_Aniket_V_Dahasahastra.jpg',     role: 'Assistant Professor, NICMAR University, Pune' },
  { name: 'Dr. Ramala Rakesh Kumar Reddy', initials: 'RR', photo: '/geofest_faculty_photos/Dr_Ramala_Rakesh_Kumar_Reddy.jpg', role: 'Assistant Professor, NICMAR University, Pune' },
  { name: 'Dr. Dyana Joseline',            initials: 'DJ', photo: '/geofest_faculty_photos/Dr_Dyana_Joseline.jpg',             role: 'Assistant Professor, NICMAR University, Pune' },
  { name: 'Dr. Senthamizh Sankar',         initials: 'SS', photo: '/geofest_faculty_photos/Dr_S_Senthamizh_Sankar.jpg',        role: 'Assistant Professor, NICMAR University, Pune' },
];

const COMMITTEE_ROLES = [
  { role: 'CHIEF PATRON',    name: 'Dr. Vijay Gupchup',            designation: 'President, NICMAR University, Pune',                              initials: 'VG', photo: '/geofest_faculty_photos/vijay-gupchup.jpg.jpeg' },
  { role: 'PATRON',          name: 'Dr. Mrs. Sushma S. Kulkarni',  designation: 'Vice Chancellor, NICMAR University, Pune',                        initials: 'SK', photo: '/geofest_faculty_photos/dr-sushma-kulkarni.jpg.jpeg' },
  { role: 'CONVENER',        name: 'Dr. Anilkumar L Agarwal',      designation: 'Dean Academics, NICMAR University, Pune',                         initials: 'AA', photo: '/geofest_faculty_photos/Agarwal_Anil.jpeg' },
  { role: 'CO-CONVENER',     name: 'Dr. Smita Krishnarao Patil',   designation: 'Associate Professor and Dean, SOE NICMAR University, Pune',        initials: 'SP', photo: '/geofest_faculty_photos/Dr_Smita_K_Patil.jpg' },
  { role: 'CO-ORDINATOR', name: 'Dr. Vidya Khanapure',     designation: 'Faculty Advisor, IGS Student Chapter NICMAR University, Pune',    initials: 'VK', photo: '/geofest_faculty_photos/Dr_Vidya_Khanapure.jpg' },
];

const IGS_COMMITTEE = [
  { name: 'Er. Suman Jain',         role: 'Chairperson, IGS Pune Chapter' },
  { name: 'Dr. Vikas Patil',        role: 'Imm. Past Chairman' },
  { name: 'Er. Deepali Kulkarni',   role: 'Honorary Secretary' },
  { name: 'Dr. R. D. Nalwade',      role: 'Honorary Treasurers' },
  { name: 'Dr. S M Nawghare',       role: 'Honorary Treasurer' },
  { name: 'Er. Ramesh Kulkarni',    role: 'Founder Member & Mentor' },
];

const EXEC_COMMITTEE = [
  'Dr. Krishnaiah Chevva',
  'Er. Annapoorni Iyer',
  'Er. Vidya Joshi',
  'Dr. Raviraj Sorate',
  'Dr. Sachin Jain',
  'Dr. Sudarshan Bobade',
  'Dr. Rohit Pote',
  'Dr. Shrikant Shinde',
  'Er. Babasaheb Jagtap',
  'Er. Sudarshan Shinde',
  'Dr. Saurav Kar',
  'Er. Aparna Joshi',
];

const KEYNOTE_SPEAKERS = [
  {
    role: 'Chief Guest',
    name: 'Er. D. S. Chaskar',
    designation: 'Chief Engineer',
    org: 'National Water Academy',
    location: 'Pune',
    initials: 'DC',
  },
  {
    role: 'Guest of Honour & Keynote Speaker',
    name: 'Dr. Vikas Patil',
    designation: 'Managing Director',
    org: 'Savi Infrastructures & Properties Pvt. Ltd.',
    location: 'Pune',
    initials: 'VP',
  },
];

const VALIDATORY_SPEAKERS = [
  {
    role: 'Chief Guest',
    name: 'Er. Mukoonda Madhab Dutta',
    designation: 'Chief Quality Assurance Expert',
    org: 'GC-Pune Metro Rail Project',
    location: 'Pune',
    initials: 'MD',
  },
];

const OFFICE_BEARERS = [
  { name: 'Aman Bagwan',               role: 'President',          icon: '👑', photo: '/GeoFest_Office_Bearers_Photos/Aman_Bagwan.jpg' },
  { name: 'Rajnandini Sanjay Mundhe',  role: 'Vice President',      icon: '🌟', photo: '/GeoFest_Office_Bearers_Photos/Rajnandini_Sanjay_Mundhe.jpg' },
  { name: 'Sudhanshu Dhakrey',         role: 'General Secretary',   icon: '📋', photo: '/GeoFest_Office_Bearers_Photos/Sudhanshu_General_Secretary.png' },
  { name: 'Palvi Phand',               role: 'General Secretary',   icon: '📋', photo: '/GeoFest_Office_Bearers_Photos/Palvi_Phand_General_Secretary.jpeg' },
  { name: 'Jeevan Abraham',            role: 'Joint Secretary',     icon: '📝', photo: '/GeoFest_Office_Bearers_Photos/Jeevan_Abraham_Joint_Secretary.jpeg' },
  { name: 'Jayesh Kolhe',              role: 'Joint Secretary',     icon: '📝', photo: '/GeoFest_Office_Bearers_Photos/Jayesh_Kolhe_Joint_Secretary.png' },
  { name: 'Jiskar Yogendra Prabhakar', role: 'Treasurer',           icon: '💰', photo: '/GeoFest_Office_Bearers_Photos/Yogendra_Prabhakar_Jiskar.jpg' },
];

const SUPPORTING_ROLES = [
  { name: 'Sheikh Faaez Ahmed',      role: 'Social Media Head',              photo: '/GeoFest_Office_Bearers_Photos/Sheikh_Faaez_Ahmed.jpg' },
  { name: 'Kokane Om Ashok',         role: 'Head Outreach',                  photo: '/GeoFest_Office_Bearers_Photos/Om_Ashok_Kokane.jpg' },
  { name: 'Waghmare Pranav Vaibhav', role: 'Online Events & Training Head',  photo: '/GeoFest_Office_Bearers_Photos/Pranav_Waghmare.jpg' },
];


const fade = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } };

/* ─── Treasure Box ─── */
function TreasureBox({ prize, size = 'sm' }) {
  const [phase, setPhase] = useState('closed');
  const isLg = size === 'lg';

  const handleClick = (e) => {
    e.stopPropagation();
    if (phase !== 'closed') return;
    setPhase('opening');
    setTimeout(() => setPhase('open'), 480);
  };

  return (
    <div className="shrink-0 flex flex-col items-center">
      <AnimatePresence mode="wait">
        {phase !== 'open' ? (
          <motion.button
            key="chest"
            type="button"
            onClick={handleClick}
            className="flex flex-col items-center gap-1 group outline-none"
            whileHover={phase === 'closed' ? { scale: 1.1 } : {}}
            whileTap={phase === 'closed' ? { scale: 0.92 } : {}}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
          >
            <motion.div
              animate={
                phase === 'opening'
                  ? { scale: [1, 1.25, 0.9, 1.15, 1], rotate: [0, -10, 10, -5, 0] }
                  : { y: [0, -4, 0] }
              }
              transition={
                phase === 'opening'
                  ? { duration: 0.45, ease: 'easeInOut' }
                  : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
              }
              className="relative"
            >
              <motion.div
                animate={phase === 'opening' ? { y: -14, rotate: -25, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.08 }}
                style={{ transformOrigin: 'bottom center' }}
                className={`${isLg ? 'w-14 h-5' : 'w-10 h-4'} rounded-t-full
                  bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-600
                  border-2 border-yellow-200/80 relative overflow-hidden`}
              >
                <div className="absolute inset-x-2 top-1 h-0.5 bg-yellow-100/60 rounded-full" />
                <div className="absolute inset-x-3 bottom-0.5 h-0.5 bg-amber-900/30 rounded-full" />
              </motion.div>
              <div className={`${isLg ? 'w-14' : 'w-10'} h-1
                bg-gradient-to-r from-amber-900/50 via-yellow-600/70 to-amber-900/50`} />
              <div className={`${isLg ? 'w-14 h-9' : 'w-10 h-7'}
                bg-gradient-to-b from-amber-500 via-amber-600 to-amber-900
                border-2 border-t-0 border-yellow-300/30 rounded-b-md relative overflow-hidden`}
              >
                <div className="absolute inset-x-0 top-2.5 h-px bg-gradient-to-r from-transparent via-amber-900/60 to-transparent" />
                <div className={`absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2
                  ${isLg ? 'w-3 h-3' : 'w-2 h-2'} rounded-full bg-amber-950 border border-yellow-300/50`} />
                <div className={`absolute left-1/2 top-[60%] -translate-x-1/2
                  ${isLg ? 'w-1.5 h-2' : 'w-1 h-1.5'} bg-amber-950 border-x border-yellow-300/40 rounded-b-sm`} />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/10 to-transparent" />
              </div>
              <div className={`absolute -inset-1 rounded-md -z-10 transition-shadow duration-300
                ${phase === 'opening'
                  ? 'shadow-[0_0_28px_rgba(251,191,36,0.85)]'
                  : 'shadow-[0_0_10px_rgba(251,191,36,0.3)] group-hover:shadow-[0_0_22px_rgba(251,191,36,0.65)]'
                }`}
              />
            </motion.div>
            {phase === 'closed' && (
              <motion.span
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="text-[9px] text-amber-400 uppercase tracking-wide font-bold"
              >
                Tap to reveal
              </motion.span>
            )}
          </motion.button>
        ) : (
          <motion.div
            key="prize"
            initial={{ scale: 0, y: 10, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 16 }}
            className="flex flex-col items-center gap-1.5"
          >
            <motion.span
              initial={{ scale: 2.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className={`${isLg ? 'text-2xl' : 'text-lg'} leading-none`}
            >
              ✨
            </motion.span>
            <div className={`flex items-center gap-1.5
              bg-gradient-to-br from-amber-500/25 to-yellow-600/15
              border border-amber-400/60 rounded-xl
              ${isLg ? 'px-3 py-2' : 'px-2.5 py-1.5'}
              shadow-[0_0_18px_rgba(251,191,36,0.5)]`}
            >
              <span className={`${isLg ? 'text-xl' : 'text-base'} leading-none`}>🏆</span>
              <div>
                <p className="text-[8px] text-amber-300/70 uppercase tracking-wide leading-none mb-0.5">Prize Pool</p>
                <p className={`${isLg ? 'text-base' : 'text-xs'} font-extrabold shimmer-text leading-none`}>
                  ₹{prize}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const navigate       = useNavigate();
  const countdown      = useCountdown(EVENT_DATE);
  const inaugCountdown = useCountdown(INAUGURATION_DATE);


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
            <img src="/NICMAR_LOGO1.jpeg" alt="NICMAR Logo" className="h-20 sm:h-24 md:h-28 w-auto object-contain rounded-2xl shadow-[0_0_24px_6px_rgba(200,200,200,0.3)]" />
            <img src="/NICMARLOGO2.jpeg"  alt="NICMAR Logo 2" className="h-20 sm:h-24 md:h-28 w-auto object-contain rounded-2xl shadow-[0_0_24px_6px_rgba(200,200,200,0.3)]" />
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

          <motion.p variants={fade} className="text-gray-200 text-base sm:text-lg mb-2 max-w-2xl mx-auto italic px-2">
            Foundation Engineering: The Anchor We Secure, For Every Megastructure to Endure.
          </motion.p>

          <motion.div variants={fade} className="mb-8 sm:mb-10 max-w-xl mx-auto px-2 space-y-1">
            <p className="text-white text-sm sm:text-base font-bold tracking-wide">
              National Level Technical &amp; Academic Festival
            </p>
            <p className="text-gray-400 text-xs sm:text-sm">
              Organised by Indian Geotechnical Society Student Chapter, NICMAR University Pune
            </p>
          </motion.div>

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
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">About <span className="shimmer-text">GeoFest — STRATA</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm sm:text-base px-2">
              GeoFest — STRATA 2026 is the fifth national-level technical fest in the series, hosted at NICMAR University,
              Pune, and organized by the Indian Geotechnical Society (IGS) Student Chapter of NICMAR University, Pune.
              Geo-Fest aims to strengthen technical foundations by engaging students through competitions, case studies,
              and interactive learning experiences in the field of Geotechnical engineering.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {OBJECTIVES.map((obj, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl px-4 sm:px-5 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 card-hover">
                <img src={obj.logo} alt={obj.text} className="w-8 h-8 sm:w-10 sm:h-10 object-contain shrink-0 logo-glow" />
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
              Know More →
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {EVENTS_PREVIEW.map((ev, i) => (
              <motion.div key={ev.title}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 sm:p-6 card-hover flex flex-col">
                <div className="h-16 sm:h-20 mb-3 flex items-center justify-between gap-2">
                  <img src={ev.logo} alt={ev.title} className="h-full w-auto object-contain" />
                  {PRIZE_POOL[ev.title] && <TreasureBox prize={PRIZE_POOL[ev.title]} />}
                </div>
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
            <p className="text-white font-bold text-sm sm:text-base">Two days of engineering excellence — 17 & 18 March 2026</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {SCHEDULE.map((day, i) => (
              <motion.div key={day.day}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="flex flex-col">
                <div className={`rounded-t-2xl bg-gradient-to-r ${day.color} px-5 sm:px-6 py-3 sm:py-4`}>
                  <h3 className="text-lg sm:text-xl font-extrabold">{day.day}</h3>
                  <p className="text-white/80 text-sm">{day.date}</p>
                </div>
                <div className="glass rounded-b-2xl p-4 space-y-3 flex-1">
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


      {/* ── INAUGURATION VENUE ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Venue photo */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="venue-glow-wrapper mb-10 sm:mb-12">
            <div>
              <img src="/event_place.jpg" alt="Event Venue" className="w-full h-56 sm:h-80 md:h-96 object-cover" />
            </div>
          </motion.div>

          {/* Timer + CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center">
            <p className="text-amber-300 font-extrabold text-xl sm:text-2xl mb-1">Inauguration Programme</p>
            <p className="text-gray-400 text-sm sm:text-base mb-6">
              17 March 2026 &nbsp;•&nbsp; 9:30 AM – 12:30 PM
            </p>

            {/* Countdown */}
            <div className="glass rounded-2xl px-4 sm:px-8 py-4 sm:py-5 inline-flex gap-4 sm:gap-8 mx-auto mb-8">
              {[['Days', inaugCountdown.days], ['Hrs', inaugCountdown.hours], ['Min', inaugCountdown.minutes], ['Sec', inaugCountdown.seconds]].map(([label, val]) => (
                <div key={label} className="text-center min-w-[40px] sm:min-w-[52px]">
                  <div className="text-3xl sm:text-4xl font-extrabold text-amber-300 tabular-nums">
                    {String(val).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            {/* Fun CTA text */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="mt-2 space-y-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">
                Your seat is waiting. <span className="shimmer-text">Will you show up?</span>
              </p>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                The ground shifts, the layers speak — and on <span className="text-amber-300 font-semibold">17 March</span>, so will you.
                Don't let this moment slip through the strata.
              </p>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ── INAUGURATION KEYNOTE SPEAKERS ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Inauguration <span className="shimmer-text">Keynote Speakers</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {KEYNOTE_SPEAKERS.map((s, i) => (
              <motion.div key={s.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-5 sm:p-7 card-hover border border-amber-500/10 flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-lg shadow-amber-500/20">
                  {s.initials}
                </div>
                <div className="min-w-0">
                  <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 mb-1.5">
                    {s.role}
                  </span>
                  <p className="font-bold text-white text-sm sm:text-base leading-snug">{s.name}</p>
                  <p className="text-amber-400 text-xs sm:text-sm mt-0.5">{s.designation}</p>
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-0.5">{s.org},</p>
                  <p className="text-gray-400 text-xs sm:text-sm">{s.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALIDATORY SPEAKER ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-1">
              Validatory <span className="shimmer-text">Speaker</span>
            </h2>
          </motion.div>

          <div className="flex justify-center">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 w-full sm:max-w-md">
              {VALIDATORY_SPEAKERS.map((s, i) => (
                <motion.div key={s.name}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5 sm:p-7 card-hover border border-amber-500/10 flex items-start gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shrink-0 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-base sm:text-lg font-bold text-white shadow-lg shadow-amber-500/20">
                    {s.initials}
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[10px] font-extrabold tracking-widest uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 mb-1.5">
                      {s.role}
                    </span>
                    <p className="font-bold text-white text-sm sm:text-base leading-snug">{s.name}</p>
                    <p className="text-amber-400 text-xs sm:text-sm mt-0.5">{s.designation}</p>
                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-0.5">{s.org},</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{s.location}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ORGANIZING COMMITTEE ── */}
      <section className="py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">GeoFest 2026 — <span className="shimmer-text">NICMAR University, Pune</span></h2>
          </motion.div>

          {/* Chief Patron, Patron, Convener, Co-Convener, Faculty Advisor */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-10">
            {COMMITTEE_ROLES.map((c, i) => (
              <motion.div key={c.role}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-3 sm:p-6 text-center card-hover border border-amber-500/10 ${
                  i === COMMITTEE_ROLES.length - 1 && COMMITTEE_ROLES.length % 2 !== 0
                    ? 'col-span-2 max-w-[calc(50%-6px)] sm:max-w-[calc(50%-12px)] mx-auto w-full'
                    : ''
                }`}>
                <div className="w-14 sm:w-24 h-14 sm:h-24 rounded-full mx-auto mb-2 sm:mb-3 overflow-hidden border-2 border-amber-500/40 shadow-lg shadow-amber-500/20">
                  {c.photo
                    ? <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-lg sm:text-2xl font-bold text-white">{c.initials}</div>
                  }
                </div>
                <span className="inline-block text-[9px] sm:text-xs font-extrabold tracking-[0.15em] uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 sm:px-3 py-0.5 sm:py-1 mb-2 sm:mb-3">
                  {c.role}
                </span>
                <h3 className="font-bold text-white text-xs sm:text-lg mb-1">{c.name}</h3>
                <p className="text-gray-400 text-[10px] sm:text-sm leading-relaxed">{c.designation}</p>
              </motion.div>
            ))}
          </div>

          {/* IGS Pune Chapter Executive Committee */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="mb-10">
            <h3 className="text-lg sm:text-xl font-extrabold text-center text-white mb-6">
              IGS Pune Chapter <span className="shimmer-text">Executive Committee</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {IGS_COMMITTEE.map((m, i) => (
                <motion.div key={m.name}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="glass rounded-xl px-4 sm:px-5 py-3 sm:py-4 card-hover">
                  <p className="font-semibold text-sm text-white">{m.name}</p>
                  <p className="text-amber-400 text-xs mt-0.5">{m.role}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Executive Committee Members */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="text-base sm:text-lg font-bold text-center text-gray-300 mb-5">Executive Committee Members</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {EXEC_COMMITTEE.map((name, i) => (
                <motion.div key={name}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl px-3 py-2.5 text-center">
                  <p className="text-xs sm:text-sm text-gray-300 font-medium leading-snug">{name}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FACULTY ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3"><span className="shimmer-text">Organising Committee GeoFest 2026</span></h2>
            <p className="text-gray-400 text-sm sm:text-base">Guiding minds, shaping engineers.</p>
          </motion.div>

          {/* Unified grid — all members */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            {[...FACULTY_ADVISORS, ...FACULTY_COORDINATORS].map((f, i, arr) => (
              <motion.div key={f.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-3 sm:p-8 text-center card-hover flex flex-col items-center ${
                  i === arr.length - 1 && arr.length % 2 !== 0
                    ? 'col-span-2 max-w-[calc(50%-6px)] sm:max-w-[calc(50%-12px)] mx-auto w-full'
                    : ''
                }`}>
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 sm:mb-4 overflow-hidden border-2 border-amber-500/40 shadow-lg shadow-amber-500/20">
                  {f.photo
                    ? <img src={f.photo} alt={f.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl sm:text-3xl font-bold text-white">
                        {f.initials}
                      </div>
                  }
                </div>
                <h3 className="font-bold text-white mb-1 text-xs sm:text-lg">{f.name}</h3>
                {f.role && <p className="text-amber-400 text-[10px] sm:text-sm">{f.role}</p>}
              </motion.div>
            ))}
          </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[...OFFICE_BEARERS, ...SUPPORTING_ROLES].map((b, i, arr) => (
              <motion.div key={b.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`glass rounded-2xl p-5 sm:p-6 text-center card-hover${
                  i === arr.length - 1 && arr.length % 3 === 1 ? ' sm:col-start-2' : ''
                }`}>
                {b.photo
                  ? <img src={b.photo} alt={b.name} className="w-16 sm:w-20 h-16 sm:h-20 rounded-full object-cover object-top mx-auto mb-3 border-2 border-emerald-500/40" />
                  : <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl mx-auto mb-3">{b.icon}</div>
                }
                <h3 className="font-bold text-white mb-1 text-sm sm:text-base">{b.name}</h3>
                <p className="text-emerald-400 text-xs">{b.role}</p>
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

          {/* Email & Location */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-5 sm:p-8 text-center mb-6 sm:mb-8">
            <p className="text-gray-400 text-sm mb-1">Email us at</p>
            <a href="mailto:Igssc@pune.nicmar.ac.in"
              className="text-amber-400 hover:text-amber-300 text-base sm:text-xl font-semibold transition break-all">
              Igssc@pune.nicmar.ac.in
            </a>
            <p className="text-gray-400 text-sm mt-4 flex items-center justify-center gap-1.5">
              <span>📍</span>
              <span>NICMAR University, 25/1, Balewadi, Pune, Maharashtra 411045</span>
            </p>
          </motion.div>

          {/* Google Maps */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-white/10 shadow-xl">
            <iframe
              title="NICMAR University Pune"
              src="https://maps.google.com/maps?q=NICMAR+University+Pune&output=embed"
              width="100%"
              height="400"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="bg-black/55 py-14 sm:py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <div className="flex items-center justify-center gap-6 mb-8">
            <img src="/NICMAR_LOGO1.jpeg" alt="NICMAR Logo" className="h-20 sm:h-24 w-auto object-contain" />
            <img src="/NICMARLOGO2.jpeg"  alt="NICMAR Logo 2" className="h-20 sm:h-24 w-auto object-contain" />
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
