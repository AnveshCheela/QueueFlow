import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';

export default function PublicDisplayPage() {
  const { queueId } = useParams();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch queue data
  const fetchData = async () => {
    try {
      const { data } = await api.get(`/queues/${queueId}/public`);
      const q = data.queue || data;
      setQueue(q);
      setTokens(data.tokens || q.tokens || []);
    } catch {
      // Try without /public suffix
      try {
        const { data } = await api.get(`/queues/${queueId}`);
        const q = data.queue || data;
        setQueue(q);
        setTokens(data.tokens || q.tokens || []);
      } catch {
        // silently fail
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 10s
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [queueId]);

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setClock(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const inServiceToken = tokens.find((t) => t.status === 'in-service');
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const upNext = waitingTokens.slice(0, 5);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col text-on-surface relative overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* CSS-only animated background */}
      <div className="absolute inset-0 bg-background -z-10" />

      {/* Main Container */}
      <div className="flex flex-col h-screen w-full max-w-[1920px] mx-auto p-4 md:p-8 relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: '2.5rem', fontVariationSettings: "'FILL' 1" }}
            >
              medical_services
            </span>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {queue?.name || 'Queue'}
            </h1>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '1.75rem' }}>campaign</span>
            <span className="text-xl font-semibold text-on-surface">Please proceed when called</span>
          </div>
        </header>

        {/* Center: Now Serving */}
        <main className="flex-1 flex items-center justify-center min-h-0 mb-4 relative">
          <div className="glow-ring rounded-[30px] glass-panel w-full max-w-4xl flex flex-col items-center justify-center text-center relative overflow-hidden py-4 px-6 md:py-8">
            {/* Top gradient bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />

            <h2 className="text-xl md:text-2xl font-semibold text-on-surface-variant uppercase tracking-[0.2em] mb-2">
              Now Serving
            </h2>

            {inServiceToken ? (
              <>
                <div className="text-[72px] md:text-[90px] font-black text-white leading-none tracking-tighter mb-2">
                  #{inServiceToken.tokenNumber || '?'}
                </div>
                <div className="text-[32px] md:text-[40px] font-bold text-white tracking-tight text-center px-4 leading-tight mb-4 md:mb-6">
                  {inServiceToken.personName || ''}
                </div>
                <div className="bg-white text-black px-6 py-2 rounded-full text-base md:text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_forward</span>
                  Proceed to Counter
                </div>
              </>
            ) : (
              <>
                <div className="text-[72px] md:text-[90px] font-black text-on-surface-variant/30 leading-none tracking-tighter mb-4">
                  —
                </div>
                <div className="text-lg md:text-xl text-on-surface-variant/60">
                  Waiting for next patient
                </div>
              </>
            )}
          </div>
        </main>

        {/* Bottom: Up Next & Footer */}
        <footer className="shrink-0 flex flex-col gap-4">
          {/* Up Next Grid */}
          <div className="glass-panel rounded-2xl p-4 border-t border-primary/30 shadow-2xl">
            <h3 className="text-lg font-semibold text-on-surface-variant mb-3 uppercase tracking-wider border-b border-outline-variant/30 pb-2">
              Up Next
            </h3>
            <div className="grid grid-cols-5 gap-4">
              {upNext.length === 0 ? (
                <div className="col-span-5 text-center text-on-surface-variant/60 text-lg py-2">
                  No patients waiting
                </div>
              ) : (
                upNext.map((token, idx) => (
                  <div
                    key={token._id}
                    className={`bg-surface-container-high rounded-xl p-4 border-l-4 ${
                      idx === 0 ? 'border-l-white' : 'border-l-outline'
                    } shadow-sm flex flex-col justify-center transition-all hover:bg-surface-variant ${
                      idx === upNext.length - 1 ? 'opacity-80' : ''
                    }`}
                  >
                    <span className="text-3xl font-bold text-white mb-1">
                      #{token.tokenNumber || '?'}
                    </span>
                    <span className="text-xl text-on-surface-variant font-medium truncate">
                      {token.personName || ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Utilities */}
          <div className="flex justify-between items-end mt-1">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>info</span>
              <span className="text-base">Please have your ID and appointment details ready.</span>
            </div>
            <div className="text-4xl font-bold text-white tracking-tighter">
              {clock}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
