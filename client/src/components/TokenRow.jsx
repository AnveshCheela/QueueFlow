import StatusBadge from './StatusBadge';

function formatWaitTime(createdAt) {
  if (!createdAt) return '';
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  if (diff < 1) return '<1m';
  return `${diff}m`;
}

export default function TokenRow({ token, onMoveUp, onMoveDown, onCancel, isFirst, isLast }) {
  return (
    <div className="flex items-center justify-between p-2 border-b border-outline-variant/20 hover:bg-surface-variant/30 transition-colors group">
      {/* Left half */}
      <div className="flex items-center gap-4 w-1/2">
        <div className="w-1 h-8 bg-white rounded-full" />
        <span className="text-sm font-medium text-on-surface-variant w-8 tracking-wide">
          #{token.tokenNumber || token.position || '?'}
        </span>
        <span className="text-base text-on-surface truncate">
          {token.personName || 'Unknown'}
        </span>
      </div>

      {/* Right half */}
      <div className="flex items-center gap-2 md:gap-4 justify-end w-1/2">
        <span className="text-sm font-medium text-on-surface-variant hidden md:inline tracking-wide">
          {formatWaitTime(token.createdAt)}
        </span>
        <StatusBadge status={token.status || 'waiting'} />

        {/* Action buttons - visible on hover */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMoveUp?.(token._id)}
            disabled={isFirst}
            className="text-on-surface-variant hover:text-white p-1 rounded hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Move up"
          >
            <span className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
          </button>
          <button
            onClick={() => onMoveDown?.(token._id)}
            disabled={isLast}
            className="text-on-surface-variant hover:text-white p-1 rounded hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Move down"
          >
            <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
          </button>
          <button
            onClick={() => onCancel?.(token._id)}
            className="text-on-surface-variant hover:text-error p-1 rounded hover:bg-error-container/20 cursor-pointer"
            title="Cancel"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
