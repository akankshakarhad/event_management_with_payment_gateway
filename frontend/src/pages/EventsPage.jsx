import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

const EVENT_ICONS = {
  'Quiz Competition':            '🧠',
  'GeoTalk':                     '🎤',
  'Connecting the Dots':         '🔗',
  'Project Display Competition': '🏗️',
  'MIDAS Workshop':              '💻',
  // legacy keys kept for fallback
  'Paper Presentation':          '📄',
  'Poster Presentation':         '🎨',
  'Field Mapping':               '🗺️',
  'Rock Identification':         '🪨',
};
const getIcon = (title) => EVENT_ICONS[title] || '🌍';

export default function EventsPage() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-slate-950 text-white overflow-x-hidden">

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 py-14 sm:py-20 px-4 text-center">
        <div className="absolute w-56 sm:w-72 h-56 sm:h-72 rounded-full bg-indigo-600 blur-[80px] sm:blur-[100px] opacity-20 top-0 left-1/2 -translate-x-1/2" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
            Our <span className="shimmer-text">Events</span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base px-2">
            Pick one or combine multiple — every event counts toward your legacy.
          </p>
        </motion.div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 sm:h-56 rounded-2xl bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-400 px-4">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((ev, i) => (
              <motion.div key={ev.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 sm:p-7 flex flex-col card-hover group">

                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  {getIcon(ev.title)}
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2">{ev.title}</h3>
                <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                  {ev.description || 'Showcase your knowledge and skills in this exciting event.'}
                </p>

                <div className="mt-4 mb-3">
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {ev.max_members === 1 ? 'Individual only' : ev.max_members === 4 ? 'Exactly 4 members' : `Max ${ev.max_members} members`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-sm font-bold shrink-0">
                    ₹{ev.price}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-500/20 w-full sm:w-auto text-center">
                    Register →
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
