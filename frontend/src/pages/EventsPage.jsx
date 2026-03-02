import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

  // ── Gallery ──
  const [activeTab, setActiveTab]           = useState('events'); // 'events' | 'gallery'
  const [galleryPhotos, setGalleryPhotos]   = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryError, setGalleryError]     = useState('');
  const [galleryFetched, setGalleryFetched] = useState(false);
  const [galleryFilter, setGalleryFilter]   = useState(''); // '' = All, else event_id
  const [lightbox, setLightbox]             = useState(null);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  useEffect(() => {
    api.get('/events')
      .then((res) => setEvents(res.data.data))
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  /* ── Deep-link from RegisterPage: ?tab=gallery&eventId=<id> ── */
  useEffect(() => {
    const tab     = searchParams.get('tab');
    const eventId = searchParams.get('eventId');
    if (tab === 'gallery') {
      setActiveTab('gallery');
      if (eventId) setGalleryFilter(eventId);
      setGalleryLoading(true);
      api.get('/gallery')
        .then((res) => { setGalleryPhotos(res.data.data); setGalleryFetched(true); })
        .catch(() => setGalleryError('Failed to load gallery.'))
        .finally(() => setGalleryLoading(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'events') setGalleryFilter('');
    if (tab === 'gallery' && !galleryFetched && !galleryLoading) {
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
            className="max-w-7xl mx-auto px-4 py-10 sm:py-14">

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
            ) : (() => {
              const filtered = galleryFilter
                ? galleryPhotos.filter((p) => p.event_id === galleryFilter)
                : galleryPhotos;
              return (
                <div className="relative flex gap-6 items-start overflow-hidden lg:overflow-visible">

                  {/* ── Mobile backdrop ── */}
                  {sidebarOpen && (
                    <div
                      className="fixed inset-0 z-30 bg-black/60 lg:hidden"
                      onClick={() => setSidebarOpen(false)}
                    />
                  )}

                  {/* ── Side panel — drawer on mobile, sticky sidebar on desktop ── */}
                  <aside className={`
                    fixed lg:sticky top-0 lg:top-24 left-0
                    h-full lg:h-[380px]
                    w-64 lg:w-56
                    z-40 lg:z-auto
                    shrink-0
                    overflow-y-auto
                    transition-transform duration-300 ease-in-out lg:!translate-x-0
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  `}>
                    <div className="glass rounded-r-2xl lg:rounded-2xl border border-slate-700/50 overflow-hidden h-full">
                      {/* Panel header */}
                      <div className="px-4 py-3.5 border-b border-slate-700/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🗂</span>
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                            Filter by Event
                          </span>
                        </div>
                        <button
                          onClick={() => setSidebarOpen(false)}
                          className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-slate-700/60 transition text-sm">
                          ✕
                        </button>
                      </div>

                      {/* All Photos */}
                      <div className="p-2">
                        <button
                          onClick={() => { setGalleryFilter(''); setSidebarOpen(false); }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group ${
                            galleryFilter === ''
                              ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                              : 'text-gray-400 hover:text-white hover:bg-slate-700/60'
                          }`}>
                          <span className="flex items-center gap-2">
                            <span className={`text-base ${galleryFilter === '' ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>🖼</span>
                            All Photos
                          </span>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                            galleryFilter === ''
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-700 text-gray-400'
                          }`}>
                            {galleryPhotos.length}
                          </span>
                        </button>

                        {/* Divider */}
                        <div className="my-2 border-t border-slate-700/40" />

                        {/* Per-event buttons */}
                        {events.map((ev) => {
                          const count = galleryPhotos.filter((p) => p.event_id === ev.id).length;
                          const isActive = galleryFilter === ev.id;
                          const logo = getLogo(ev.title);
                          return (
                            <button key={ev.id}
                              onClick={() => { setGalleryFilter(ev.id); setSidebarOpen(false); }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between group mb-0.5 ${
                                isActive
                                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                                  : 'text-gray-400 hover:text-white hover:bg-slate-700/60'
                              }`}>
                              <span className="flex items-center gap-2 min-w-0">
                                {logo
                                  ? <img src={logo} alt="" className="w-4 h-4 object-contain shrink-0 opacity-80" />
                                  : <span className="text-sm shrink-0 opacity-60">🌍</span>
                                }
                                <span className="truncate">{normalizeTitle(ev.title)}</span>
                              </span>
                              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1 ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : 'bg-slate-700 text-gray-400'
                              }`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </aside>

                  {/* ── Photo grid ── */}
                  <div className="flex-1 min-w-0 w-full">

                    {/* Mobile: count + filter toggle button */}
                    <div className="flex items-center justify-between mb-4 lg:hidden">
                      <p className="text-gray-500 text-xs">
                        {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
                        {galleryFilter ? ` · ${normalizeTitle(events.find(e => e.id === galleryFilter)?.title || '')}` : ''}
                      </p>
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl text-xs font-semibold text-gray-300 border border-slate-700/50 hover:text-white hover:border-amber-500/40 transition">
                        <span>🗂</span>
                        Filter
                        {galleryFilter && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5" />}
                      </button>
                    </div>

                    {/* Desktop: just the count */}
                    <p className="hidden lg:block text-gray-500 text-xs mb-4">
                      {filtered.length} photo{filtered.length !== 1 ? 's' : ''}
                      {galleryFilter ? ` · ${normalizeTitle(events.find(e => e.id === galleryFilter)?.title || '')}` : ''}
                    </p>

                    {filtered.length === 0 ? (
                      <div className="text-center py-20 text-gray-600">
                        <div className="text-5xl mb-3">📭</div>
                        <p>No photos for this event yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                        {filtered.map((photo, i) => (
                          <motion.div key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => setLightbox(photo)}
                            className="group cursor-pointer">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden
                                            border border-slate-700/60
                                            group-hover:border-amber-500/50 group-hover:shadow-lg
                                            group-hover:shadow-amber-500/10 transition-all duration-300">
                              <img
                                src={photo.image_data}
                                alt={photo.description || 'Event photo'}
                                className="w-full h-full object-cover"
                              />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100
                                              transition-opacity duration-300 flex items-center justify-center">
                                <div className="bg-white/10 backdrop-blur-sm border border-white/20
                                                rounded-full px-4 py-1.5 text-white text-xs font-semibold">
                                  View Photo
                                </div>
                              </div>
                            </div>
                            {/* Caption below */}
                            {(photo.event_title || photo.description) && (
                              <div className="mt-1.5 px-1 flex items-center gap-1.5">
                                {photo.event_title && (
                                  <span className="text-amber-400 text-[11px] font-semibold shrink-0">
                                    {normalizeTitle(photo.event_title)}
                                  </span>
                                )}
                                {photo.event_title && photo.description && (
                                  <span className="text-gray-600 text-[11px]">·</span>
                                )}
                                {photo.description && (
                                  <p className="text-gray-400 text-[11px] truncate">{photo.description}</p>
                                )}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl">

              {/* Photo frame — no title bar */}
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/10
                              shadow-[0_0_60px_rgba(0,0,0,0.9)]">
                {/* 16:9 photo */}
                <div className="relative w-full bg-[#130e07]" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={lightbox.image_data}
                    alt={lightbox.description || 'Event photo'}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                </div>

                {/* Description bar — only shown when there's something to display */}
                {(lightbox.event_title || lightbox.description) && (
                  <div className="px-4 py-3 bg-[#130e07] border-t border-white/[0.07] flex items-center gap-2">
                    {lightbox.event_title && (
                      <span className="text-amber-400 text-xs font-semibold shrink-0">
                        {normalizeTitle(lightbox.event_title)}
                      </span>
                    )}
                    {lightbox.event_title && lightbox.description && (
                      <span className="text-gray-600 text-xs shrink-0">·</span>
                    )}
                    {lightbox.description && (
                      <p className="text-gray-300 text-xs">{lightbox.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Close button — floats top-right outside the frame */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-9 sm:h-9
                           bg-slate-800 hover:bg-red-600 border border-white/10 text-white
                           rounded-full flex items-center justify-center text-sm transition-colors shadow-lg">
                ✕
              </button>

              {/* Glow */}
              <div className="absolute -inset-2 rounded-3xl bg-amber-500/8 blur-2xl -z-10 pointer-events-none" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
