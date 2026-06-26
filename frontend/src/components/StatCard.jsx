import { motion } from 'framer-motion';

const gradients = [
  'from-cyan-400 to-blue-500',
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-indigo-400 to-blue-600',
  'from-fuchsia-500 to-pink-500',
  'from-green-400 to-emerald-500',
  'from-red-400 to-rose-600',
];

export default function StatCard({ label, value, icon: Icon, index = 0, color }) {
  const gradient = color || gradients[index % gradients.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm card-hover"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">{label}</p>
          <p className="mt-3 text-4xl font-bold text-white tabular-nums">
            {value ?? <span className="skeleton w-16 h-8 inline-block" />}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
      <div className={`mt-4 h-1 w-full rounded-full bg-slate-800`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`} style={{ width: value ? '100%' : '0%' }} />
      </div>
    </motion.div>
  );
}
