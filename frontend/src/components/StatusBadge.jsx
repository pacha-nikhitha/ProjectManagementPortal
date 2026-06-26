const statusConfig = {
  Planning: { bg: 'bg-slate-500/15', text: 'text-slate-400' },
  Active: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  'In Progress': { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  Pending: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  'On Hold': { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  Cancelled: { bg: 'bg-red-500/15', text: 'text-red-400' },
  Archived: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
};

export default function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.Planning;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  );
}
