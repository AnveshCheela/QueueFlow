function formatWaitTime(createdAt) {
  if (!createdAt) return '';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diff < 1) return '<1m';
  return `${diff}m`;
}

export default function NowServing({ token }) {
  if (!token) {
    return (
      <section className="glass-panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-outline-variant" />
        <div className="flex items-center gap-2 pl-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[16px]">campaign</span>
          <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Now Serving</span>
        </div>
        <div className="mt-4 pl-2">
          <p className="text-base text-on-surface-variant/60">No one is currently being served.</p>
          <p className="text-sm text-on-surface-variant/40 mt-1">Click "Call Next" to begin.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel rounded-xl p-6 relative overflow-hidden group">
      {/* Solid white border */}
      <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />

      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h2 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">campaign</span>
          Now Serving
        </h2>
      </div>

      {/* Content */}
      <div className="flex flex-col relative z-10">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-bold text-on-surface leading-none tracking-tight">
            #{token.tokenNumber || '?'}
          </span>
          <h3 className="text-3xl font-semibold text-on-surface">
            {token.personName || 'Unknown'}
          </h3>
        </div>
        <p className="text-sm text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          Waiting for {formatWaitTime(token.createdAt)}
        </p>
      </div>
    </section>
  );
}
