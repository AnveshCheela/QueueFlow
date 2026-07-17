import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';

export default function MobileStatusPage() {
  const { queueId } = useParams();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const { data } = await api.get(`/public/queues/${queueId}`);
      const q = data.queue || data;
      setQueue(q);
      setTokens(data.tokens || q.tokens || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [queueId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inServiceToken = tokens.find((t) => t.status === 'in-service');
  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const completedTokens = tokens.filter((t) => t.status === 'completed');
  
  // AI Predictor Algorithm
  let avgServiceMs = 5 * 60000; // default 5 mins
  if (completedTokens.length > 0) {
    let totalTime = 0;
    let valid = 0;
    completedTokens.forEach(t => {
      if (t.calledAt && t.completedAt) {
        const time = new Date(t.completedAt).getTime() - new Date(t.calledAt).getTime();
        if (time > 0 && time < 3600000) { // Only count if reasonable (under 1hr)
          totalTime += time;
          valid++;
        }
      }
    });
    if (valid > 0) {
      avgServiceMs = totalTime / valid;
    }
  }
  
  const estWaitTime = Math.round((waitingTokens.length * avgServiceMs) / 60000);

  const formatEstimatedTime = (index) => {
    // Current time + (position * avgServiceTime)
    const d = new Date(Date.now() + (index + 1) * avgServiceMs);
    let hours = d.getHours();
    let mins = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    mins = mins < 10 ? '0'+mins : mins;
    return `${hours}:${mins} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col antialiased font-sans">
      <header className="p-4 border-b border-white/10 flex justify-center items-center relative">
        <h1 className="text-xl font-bold tracking-tight text-white">{queue?.name || 'Clinic Queue'}</h1>
      </header>

      <main className="flex-1 p-4 flex flex-col gap-6 max-w-md mx-auto w-full mt-4">
        {/* Now Serving Card */}
        <div className="bg-surface-variant/30 border border-white/20 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-white" />
          <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-4">Now Serving</h2>
          {inServiceToken ? (
            <>
              <div className="text-7xl font-black text-white mb-2 leading-none">#{inServiceToken.tokenNumber}</div>
              <div className="text-xl font-medium text-white">{inServiceToken.personName}</div>
            </>
          ) : (
            <>
              <div className="text-6xl font-black text-on-surface-variant/30 mb-2">—</div>
              <div className="text-lg text-on-surface-variant/60">Waiting for next patient</div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-variant/30 border border-white/10 rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-white mb-1">group</span>
            <div className="text-2xl font-bold text-white mb-1">{waitingTokens.length}</div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider">People Waiting</div>
          </div>
          <div className="bg-surface-variant/30 border border-white/10 rounded-xl p-4 text-center">
            <span className="material-symbols-outlined text-white mb-1">schedule</span>
            <div className="text-2xl font-bold text-white mb-1">~{estWaitTime}m</div>
            <div className="text-xs text-on-surface-variant uppercase tracking-wider">Est. Wait Time</div>
          </div>
        </div>

        {/* Up Next List */}
        <div>
          <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-3 pl-1">Up Next</h3>
          <div className="flex flex-col gap-2">
            {waitingTokens.length === 0 ? (
              <div className="text-center p-4 text-on-surface-variant/50 border border-white/10 rounded-xl">No one is waiting.</div>
            ) : (
              waitingTokens.slice(0, 5).map((token, idx) => (
                <div key={token._id} className="flex justify-between items-center p-4 bg-surface-variant/10 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-white w-8">#{token.tokenNumber}</span>
                    <span className="text-base text-on-surface-variant">{token.personName}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="text-sm font-medium text-white">{formatEstimatedTime(idx)}</div>
                    {idx === 0 && <span className="text-[10px] font-bold bg-white text-black px-2 py-0.5 rounded-md mt-1">NEXT</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-on-surface-variant/50 text-xs">
        Updates automatically every 10 seconds.
      </footer>
    </div>
  );
}
