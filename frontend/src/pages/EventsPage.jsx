import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

// Normalize legacy DB titles to canonical display names
const TITLE_MAP = {
  'GeoFest Arena Quiz':             'Quiz Competition',
  'GeoTalk':                        'Geotalk',
  'Geotalk (Paper Presentation)':   'Geotalk',
  'GeoFest Project Expo':           'Project Display',
  'Connecting the Dots':            'Connecting The Dots',
  'Midas Software Workshop':        'Midas Software Workshop',
};
const normalizeTitle = (title) => TITLE_MAP[title] || title;

const EVENT_LOGOS = {
  'Quiz Competition':        '/Logos_Events/Quiz.png',
  'Geotalk':                 '/Logos_Events/GeoTalk.png',
  'Connecting The Dots':     '/Logos_Events/Connecting.png',
  'Project Display':         '/Logos_Events/Project.png',
  'Midas Software Workshop': '/Logos_Events/Midas.png',
};
const getLogo = (title) => EVENT_LOGOS[normalizeTitle(title)] || null;

const DESC_MAP = {
  'Quiz Competition':        'Technical quiz testing Geotechnical knowledge, speed, accuracy, and analytical thinking.',
  'Connecting The Dots':     'Solve real-world Geotechnical problems by connecting multi-disciplinary concepts.',
  'Geotalk':                 'Present your research paper or innovative idea in Geotechnical / civil engineering.',
  'Project Display':         'Showcase innovative Geotechnical projects, models, prototypes, and engineering solutions.',
  'Midas Software Workshop': 'Expert workshop on MIDAS applications in Geotechnical engineering and design.',
};
const getDesc = (title) => DESC_MAP[normalizeTitle(title)] || null;

export default function EventsPage() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  // ── Gallery ──
  const [activeTab, setActiveTab]           = useState('events'); // 'events' | 'gallery'
  const [galleryPhotos, setGalleryPhotos]   = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError]     = useState('');
  const [galleryFetched, setGalleryFetched] = useState(false);
  const [lightbox, setLightbox]             = useState(null);

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'gallery' && !galleryFetched) {
      setGalleryLoading(true);
      api.get('/gallery')
        .then((res) => { setGalleryPhotos(res.data.data); setGalleryFetched(true); })
        .catch(() => setGalleryError('Failed to load gallery.'))
        .finally(() => setGalleryLoading(false));
    }
  };

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

          {/* Tab switcher */}
          <div className="mt-8 inline-flex glass rounded-xl p-1 gap-1">
            {[
              { label: '🗂 Events',  value: 'events' },
              { label: '🖼 Gallery', value: 'gallery' },
            ].map((t) => (
              <button key={t.value} onClick={() => handleTabChange(t.value)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeTab === t.value
                    ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── EVENTS TAB ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'events' && (
          <motion.div key="events"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="max-w-5xl mx-auto px-4 py-10 sm:py-16">
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

                    <h3 className="text-lg sm:text-xl font-bold mb-2">{normalizeTitle(ev.title)}</h3>
                    <p className="text-gray-400 text-sm flex-1 leading-relaxed">
                      {getDesc(ev.title) || ev.description}
                    </p>

                    <div className="mt-4 mb-3">
                      <span className="text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        {ev.max_members === 1 ? 'Individual only' : normalizeTitle(ev.title) === 'Connecting The Dots' ? 'Exactly 3 members' : `Upto ${ev.max_members} members`}
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
          </motion.div>
        )}

        {/* ── GALLERY TAB ── */}
        {activeTab === 'gallery' && (
          <motion.div key="gallery"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="max-w-6xl mx-auto px-4 py-10 sm:py-16">

            {galleryLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map((i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-slate-800 animate-pulse" />
                ))}
              </div>
            ) : galleryError ? (
              <p className="text-center text-red-400">{galleryError}</p>
            ) : galleryPhotos.length === 0 ? (
              <div className="text-center py-24 text-gray-600">
                <div className="text-6xl mb-4">📷</div>
                <p className="text-lg font-semibold mb-1">No photos yet</p>
                <p className="text-sm">Check back after the event!</p>
              </div>
            ) : (
              <>
                <p className="text-gray-500 text-sm mb-6 text-center">
                  {galleryPhotos.length} photo{galleryPhotos.length !== 1 ? 's' : ''} from the event
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {galleryPhotos.map((photo, i) => (
                    <motion.div key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => setLightbox(photo)}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-800 cursor-pointer">
                      <img
                        src={photo.image_data}
                        alt={photo.description || 'Event photo'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {photo.description && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <p className="text-white text-xs line-clamp-3">{photo.description}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full">
              <img
                src={lightbox.image_data}
                alt={lightbox.description || 'Event photo'}
                className="w-full rounded-2xl object-contain max-h-[82vh] shadow-2xl"
              />
              {lightbox.description && (
                <p className="text-gray-300 text-center mt-4 text-sm px-4">{lightbox.description}</p>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-4 -right-4 bg-slate-700 hover:bg-red-600 text-white w-9 h-9
                           rounded-full text-base flex items-center justify-center transition shadow-lg">
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
