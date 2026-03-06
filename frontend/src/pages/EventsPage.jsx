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
  'Geotalk':                 'Present your research paper or innovative idea in Geotechnical engineering.',
  'Project Display':         'Showcase innovative Geotechnical projects, models, prototypes, and engineering solutions.',
  'Midas Software Workshop': 'Expert workshop on MIDAS applications in Geotechnical engineering and design.',
};
const getDesc = (title) => DESC_MAP[normalizeTitle(title)] || null;

const PRIZE_POOL = {
  'Quiz Competition':    '15,000',
  'Connecting The Dots': '15,000',
  'Geotalk':             '15,000',
  'Project Display':     '22,000',
};
const getPrize = (title) => PRIZE_POOL[normalizeTitle(title)] || null;

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

export default function EventsPage() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── Rule Books (per event) ──
  const [rulebooks, setRulebooks]         = useState([]);
  const [rulebookModal, setRulebookModal] = useState(null); // holds rulebook object

  // iOS detection — PDFs don't render in iframes on iOS; open in new tab instead
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  const getEventRulebook = (eventId) => rulebooks.find((r) => r.event_id === eventId) || null;

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

    api.get('/rulebook')
      .then((res) => setRulebooks(res.data.data || []))
      .catch(() => {}); // fail silently
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
              { label: '📋 Event Details', value: 'gallery' },
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

          {/* Mobile gallery filter bar — only when gallery tab is active */}
          {activeTab === 'gallery' && !galleryLoading && galleryPhotos.length > 0 && (
            <div className="mt-4 lg:hidden flex gap-2 overflow-x-auto pb-1 px-1 max-w-sm mx-auto">
              {/* All Photos pill */}
              <button
                onClick={() => setGalleryFilter('')}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  galleryFilter === ''
                    ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                    : 'glass text-gray-400 border border-slate-700/50 hover:text-white'
                }`}>
                <span>🖼</span>
                All
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                  galleryFilter === '' ? 'bg-white/20 text-white' : 'bg-slate-700 text-gray-400'
                }`}>{galleryPhotos.length}</span>
              </button>

              {events.map((ev) => {
                const count = galleryPhotos.filter((p) => p.event_id === ev.id).length;
                const isActive = galleryFilter === ev.id;
                const logo = getLogo(ev.title);
                return (
                  <button key={ev.id}
                    onClick={() => setGalleryFilter(ev.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      isActive
                        ? 'bg-amber-600 text-white shadow shadow-amber-500/30'
                        : 'glass text-gray-400 border border-slate-700/50 hover:text-white'
                    }`}>
                    {logo
                      ? <img src={logo} alt="" className="w-3.5 h-3.5 object-contain shrink-0 opacity-90" />
                      : <span>🌍</span>
                    }
                    <span className="truncate max-w-[72px]">{normalizeTitle(ev.title)}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-gray-400'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
          )}
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

                    <div className="h-20 sm:h-24 mb-3 sm:mb-4 flex items-center justify-between gap-2">
                      <div className="h-full flex items-center group-hover:scale-110 transition-transform duration-300">
                        {getLogo(ev.title)
                          ? <img src={getLogo(ev.title)} alt={ev.title} className="h-full w-auto object-contain" />
                          : <span className="text-6xl sm:text-7xl">🌍</span>
                        }
                      </div>
                      {getPrize(ev.title) && <TreasureBox prize={getPrize(ev.title)} />}
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
                    {/* Rule Book buttons — shown only if this event has one */}
                    {(() => {
                      const rb = getEventRulebook(ev.id);
                      if (!rb) return null;
                      return (
                        <div className="flex gap-2 mb-3 flex-wrap">
                          <button
                            onClick={() => {
                              if (isIOS && rb.file_type === 'application/pdf') {
                                window.open(`/api/rulebook/${rb.id}/view`, '_blank');
                              } else {
                                setRulebookModal(rb);
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                                       bg-slate-700 hover:bg-slate-600 text-white transition">
                            📖 View Rules
                          </button>
                          <a
                            href={`/api/rulebook/${rb.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg
                                       bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 text-amber-300 transition">
                            ⬇ Download Rules
                          </a>
                        </div>
                      );
                    })()}

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

                  {/* ── Side panel — sticky sidebar on desktop only ── */}
                  <aside className="hidden lg:block lg:sticky top-24 h-[380px] w-56 shrink-0 overflow-y-auto">
                    <div className="glass rounded-r-2xl lg:rounded-2xl border border-slate-700/50 overflow-hidden h-full">
                      {/* Panel header */}
                      <div className="px-4 py-3.5 border-b border-slate-700/50 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🗂</span>
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                            Filter by Event
                          </span>
                        </div>
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

                    {/* Photo count */}
                    <p className="text-gray-500 text-xs mb-4">
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

      {/* Rule Book Modal — uses backend URLs (works on all devices incl. iOS) */}
      <AnimatePresence>
        {rulebookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRulebookModal(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-6">
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl">

              {/* Header bar */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-t-2xl px-4 py-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">
                    {rulebookModal.file_type === 'application/pdf' ? '📄'
                      : rulebookModal.file_type?.startsWith('image/') ? '🖼'
                      : '📋'}
                  </span>
                  <span className="text-white text-sm font-semibold truncate">{rulebookModal.file_name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`/api/rulebook/${rulebookModal.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">
                    Download
                  </a>
                  <button
                    onClick={() => setRulebookModal(null)}
                    className="w-8 h-8 bg-slate-700 hover:bg-red-600 border border-white/10 text-white
                               rounded-full flex items-center justify-center text-sm transition-colors shrink-0">
                    ✕
                  </button>
                </div>
              </div>

              {/* Content area — iframe uses backend URL so it loads fast & works on all browsers */}
              <div className="bg-slate-950 border-x border-b border-slate-700 rounded-b-2xl overflow-hidden"
                   style={{ height: '75vh' }}>
                {rulebookModal.file_type?.startsWith('image/') ? (
                  <img
                    src={`/api/rulebook/${rulebookModal.id}/view`}
                    alt="Rule Book"
                    className="w-full h-full object-contain"
                  />
                ) : rulebookModal.file_type === 'application/pdf' ? (
                  <iframe
                    src={`/api/rulebook/${rulebookModal.id}/view`}
                    title="Rule Book"
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4 px-4 text-center">
                    <div className="text-5xl">📋</div>
                    <p className="text-sm">Preview not available for this file type.</p>
                    <a
                      href={`/api/rulebook/${rulebookModal.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
                      Download to view
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
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
