import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

const EVENT_LOGOS = {
  // current titles
  'GeoFest Arena Quiz':          '/Logos_Events/Quiz.png',
  'GeoTalk':                     '/Logos_Events/GeoTalk.png',
  'Connecting the Dots':         '/Logos_Events/Connecting.png',
  'GeoFest Project Expo':        '/Logos_Events/Project.png',
  'Midas Software Workshop':     '/Logos_Events/Midas.png',
  // legacy DB titles (pre-reseed)
  'Quiz Competition':            '/Logos_Events/Quiz.png',
  'Geotalk (Paper Presentation)':'/Logos_Events/GeoTalk.png',
  'Project Display':             '/Logos_Events/Project.png',
  'Project Display Competition': '/Logos_Events/Project.png',
  'MIDAS Workshop':              '/Logos_Events/Midas.png',
};
const getLogo = (title) => EVENT_LOGOS[title] || null;

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
    <div className="pt-14 sm:pt-16 min-h-screen text-white overflow-x-hidden">

      {/* Header */}
      <div className="relative overflow-hidden bg-black/50 py-14 sm:py-20 px-4 text-center">
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

                <div className="h-20 sm:h-24 mb-3 sm:mb-4 flex items-center group-hover:scale-110 transition-transform duration-300">
                  {getLogo(ev.title)
                    ? <img src={getLogo(ev.title)} alt={ev.title} className="h-full w-auto object-contain" />
                    : <span className="text-6xl sm:text-7xl">🌍</span>
                  }
                </div>

                <h3 className="text-lg sm:text-xl font-bold mb-2">{ev.title}</h3>
                <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                  {ev.description || 'Showcase your knowledge and skills in this exciting event.'}
                </p>

                <div className="mt-4 mb-3">
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {ev.max_members === 1 ? 'Individual only' : ev.max_members === 4 ? 'Exactly 4 members' : `Upto ${ev.max_members} members`}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="bg-amber-600/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full text-sm font-bold shrink-0">
                    ₹{ev.price}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')}
                    className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-lg shadow-amber-500/20 w-full sm:w-auto text-center">
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
