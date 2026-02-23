import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Burst confetti
    const fire = (opts) => confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, ...opts });
    fire({ colors: ['#4f46e5', '#7c3aed', '#06b6d4'] });
    setTimeout(() => fire({ colors: ['#f472b6', '#a78bfa', '#34d399'], angle: 60,  origin: { x: 0 } }), 250);
    setTimeout(() => fire({ colors: ['#f472b6', '#a78bfa', '#34d399'], angle: 120, origin: { x: 1 } }), 400);
  }, []);

  return (
    <div className="pt-14 sm:pt-16 min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="glass rounded-3xl p-6 sm:p-10 max-w-md w-full text-center">

        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-6xl sm:text-7xl mb-5 sm:mb-6">✅</motion.div>

        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
          <span className="shimmer-text">Payment Successful!</span>
        </h2>

        <p className="text-gray-400 text-sm mb-6 sm:mb-8 leading-relaxed">
          Your registration for <span className="text-white font-semibold">GeoFest 2026</span> is confirmed.
          We'll see you on 17–18 March at NICMAR University, Pune!
        </p>

        <div className="space-y-3">
          <motion.button onClick={() => navigate('/')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition">
            Back to Home
          </motion.button>
          <motion.button onClick={() => navigate('/events')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 glass text-gray-300 hover:text-white font-semibold rounded-xl transition">
            Explore More Events
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
