const STATUS_STYLES = {
  waiting: {
    bg: 'bg-white/5',
    text: 'text-white/70',
    border: 'border-white/20',
    icon: 'schedule',
  },
  'in-service': {
    bg: 'bg-white',
    text: 'text-black',
    border: 'border-white',
    icon: 'record_voice_over',
  },
  completed: {
    bg: 'bg-white/10',
    text: 'text-white',
    border: 'border-white/40',
    icon: 'check',
  },
  cancelled: {
    bg: 'bg-transparent',
    text: 'text-white/40',
    border: 'border-white/10',
    icon: 'block',
  },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.waiting;
  const label = status === 'in-service' ? 'In Service' : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`${style.bg} ${style.text} ${style.border} text-xs font-semibold tracking-wider px-2 py-1 rounded border flex items-center gap-1 uppercase`}
    >
      <span className="material-symbols-outlined text-[12px]">{style.icon}</span>
      {label}
    </span>
  );
}
