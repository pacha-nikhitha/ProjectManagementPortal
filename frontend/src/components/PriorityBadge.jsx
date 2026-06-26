const priorityConfig = {
  Low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' },
  High: { bg: 'bg-orange-500/15', text: 'text-orange-400', dot: 'bg-orange-400' },
  Critical: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' },
};

export default function PriorityBadge({ priority }) {
  const cfg = priorityConfig[priority] || priorityConfig.Medium;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {priority}
    </span>
  );
}
