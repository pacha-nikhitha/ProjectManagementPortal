import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/80 p-12 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">404</p>
        <h1 className="mt-4 text-5xl font-semibold">Page not found</h1>
        <p className="mt-4 text-slate-400">The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/')} className="mt-8 rounded-3xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-3 text-sm font-semibold text-slate-950">Back to home</button>
      </motion.div>
    </div>
  );
}
