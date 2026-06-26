export default function EmptyState({ title, message, icon: Icon, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-800/80 text-slate-600">
          <Icon className="h-10 w-10" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm mb-6">{message}</p>
      {action && (
        <button
          onClick={action}
          className="rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg hover:scale-105 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
