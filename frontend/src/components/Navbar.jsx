import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/',         label: 'Home' },
  { to: '/events',   label: 'Events' },
  { to: '/register', label: 'Register' },
  { to: '/admin',    label: 'Admin' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  /* Close drawer on route change */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* Prevent body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
        style={{ background: 'rgba(15, 15, 35, 0.92)', backdropFilter: 'blur(16px)' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🌍</span>
            <div className="flex flex-col leading-none">
              <span className="text-white font-extrabold text-base sm:text-lg tracking-wide shimmer-text">
                GeoFest 2026
              </span>
              <span className="text-indigo-400 text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase">
                STRATA
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all block ${
                    pathname === l.to
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-1.5 rounded-lg hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
              className="block w-5 h-0.5 bg-white rounded-full origin-center"
            />
            <motion.span
              animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
              className="block w-5 h-0.5 bg-white rounded-full"
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
              className="block w-5 h-0.5 bg-white rounded-full origin-center"
            />
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />

            {/* Drawer panel */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[52px] left-0 right-0 z-40 md:hidden border-b border-white/10 px-4 py-4 space-y-1"
              style={{ background: 'rgba(15, 15, 35, 0.97)', backdropFilter: 'blur(16px)' }}
            >
              {links.map((l) => (
                <Link key={l.to} to={l.to}>
                  <motion.div
                    whileTap={{ scale: 0.97 }}
                    className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                      pathname === l.to
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {l.label}
                  </motion.div>
                </Link>
              ))}

              <div className="pt-2 border-t border-white/10 mt-2">
                <p className="text-xs text-gray-500 text-center">
                  IGS Student Chapter • NICMAR University, Pune
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
