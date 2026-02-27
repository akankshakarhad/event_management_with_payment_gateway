import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FailurePage() {
  const navigate = useNavigate();

  return (
    <div className="pt-14 sm:pt-16 min-h-screen text-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 sm:p-10 max-w-md w-full text-center">

        <motion.div
          animate={{ x: [-10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl sm:text-7xl mb-5 sm:mb-6">❌</motion.div>

        <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 text-red-400">Payment Failed</h2>

        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Something went wrong with your payment. Don't worry — your registration details are saved.
          You can try paying again below.
        </p>

        <div className="space-y-3">
          <motion.button onClick={() => navigate('/register')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold rounded-xl shadow-lg transition">
            Try Again
          </motion.button>
          <motion.button onClick={() => navigate('/')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="w-full py-3.5 glass text-gray-400 hover:text-white font-semibold rounded-xl transition text-sm">
            Back to Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
