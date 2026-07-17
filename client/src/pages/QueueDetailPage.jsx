import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import NowServing from '../components/NowServing';
import TokenRow from '../components/TokenRow';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';

export default function QueueDetailPage() {
  const { id } = useParams();
  const [queue, setQueue] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientName, setPatientName] = useState('');
  const [adding, setAdding] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const { data } = await api.get(`/queues/${id}`);
      const q = data.queue || data;
      setQueue(q);
      setTokens(data.tokens || q.tokens || []);
    } catch (err) {
      toast.error('Failed to load queue');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const inServiceToken = tokens.find((t) => t.status === 'in-service');
  const historyTokens = tokens.filter((t) => t.status === 'completed' || t.status === 'cancelled');

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setAdding(true);
    try {
      await api.post(`/queues/${id}/tokens`, { personName: patientName.trim() });
      setPatientName('');
      toast.success('Patient added');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add patient');
    } finally {
      setAdding(false);
    }
  };

  const handleCallNext = async () => {
    try {
      await api.post(`/queues/${id}/call-next`);
      toast.success('Calling next patient');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to call next');
    }
  };

  const handleComplete = async () => {
    try {
      if (!inServiceToken) return;
      await api.patch(`/tokens/${inServiceToken._id}/complete`);
      toast.success('Patient completed');
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete');
    }
  };

  const handleMoveUp = async (tokenId) => {
    try {
      await api.patch(`/tokens/${tokenId}/move`, { direction: 'up' });
      fetchQueue();
    } catch (err) {
      toast.error('Failed to move token');
    }
  };

  const handleMoveDown = async (tokenId) => {
    try {
      await api.patch(`/tokens/${tokenId}/move`, { direction: 'down' });
      fetchQueue();
    } catch (err) {
      toast.error('Failed to move token');
    }
  };

  const handleCancel = async (tokenId) => {
    try {
      await api.patch(`/tokens/${tokenId}/cancel`);
      toast.success('Token cancelled');
      fetchQueue();
    } catch (err) {
      toast.error('Failed to cancel token');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-on-surface min-h-screen flex flex-col overflow-x-hidden bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-6 pt-20 flex flex-col md:flex-row gap-6">
        {/* Left Column (60%) */}
        <div className="w-full md:w-3/5 flex flex-col gap-6">
          {/* Back link */}
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-sm w-fit"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Home
          </Link>

          {/* Queue title */}
          <h1 className="text-3xl font-semibold text-on-surface">{queue?.name || 'Queue'}</h1>

          {/* Now Serving Banner */}
          <NowServing token={inServiceToken} />

          {/* Control Buttons */}
          <div className="flex gap-4 w-full">
            <button
              onClick={handleComplete}
              disabled={!inServiceToken}
              className="flex-1 bg-white hover:bg-gray-200 text-black text-xl font-semibold py-4 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-0"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Complete
            </button>
            <button
              onClick={handleCallNext}
              disabled={!!inServiceToken || waitingTokens.length === 0}
              className="flex-1 bg-transparent hover:bg-white/10 border border-white/30 text-white text-xl font-semibold py-4 rounded-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined">record_voice_over</span>
              Call Next
            </button>
          </div>

          {/* Add Patient Form */}
          <section className="glass-panel-glow rounded-xl p-4">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Add to Queue</h3>
            <form onSubmit={handleAddPatient} className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-1 w-full">
                <label htmlFor="patientName" className="sr-only">Patient Name</label>
                <input
                  id="patientName"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant text-on-surface focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-base py-2 px-4 placeholder:text-on-surface-variant/50 transition-colors outline-none"
                  placeholder="Patient Name"
                />
              </div>
              <button
                type="submit"
                disabled={adding}
                className="w-full sm:w-auto bg-transparent border border-outline-variant text-on-surface hover:border-primary hover:text-primary text-base py-2 px-6 rounded-md transition-colors whitespace-nowrap flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Add
              </button>
            </form>
          </section>

          {/* Waiting List */}
          <section className="glass-panel-glow rounded-xl flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center">
              <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider">Waiting List</h3>
              <span className="text-sm font-medium text-on-surface-variant bg-surface-variant px-2 py-1 rounded">
                {waitingTokens.length} Patient{waitingTokens.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-col">
              {waitingTokens.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant/60">
                  No patients waiting.
                </div>
              ) : (
                waitingTokens.map((token, idx) => (
                  <TokenRow
                    key={token._id}
                    token={token}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onCancel={handleCancel}
                    isFirst={idx === 0}
                    isLast={idx === waitingTokens.length - 1}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column (40%) */}
        <div className="w-full md:w-2/5 flex flex-col">
          <section className="glass-panel-glow rounded-xl h-full flex flex-col">
            {/* Header - collapsible */}
            <div
              onClick={() => setHistoryOpen(!historyOpen)}
              className="px-4 py-2 border-b border-outline-variant/30 bg-surface-container-low flex justify-between items-center cursor-pointer hover:bg-surface-variant/30 transition-colors"
            >
              <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Activity History
              </h3>
              <span
                className="material-symbols-outlined text-on-surface-variant transition-transform duration-300"
                style={{ transform: historyOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
              >
                expand_less
              </span>
            </div>

            {/* History content */}
            {historyOpen && (
              <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                {historyTokens.length === 0 ? (
                  <div className="p-4 text-center text-on-surface-variant/60 text-sm">
                    No activity yet.
                  </div>
                ) : (
                  historyTokens.map((token) => (
                    <div
                      key={token._id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-variant/20 transition-colors border border-transparent hover:border-outline-variant/30"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-on-surface-variant">
                            #{token.tokenNumber}
                          </span>
                          <span className={`text-sm text-on-surface ${token.status === 'cancelled' ? 'line-through text-on-surface-variant' : ''}`}>
                            {token.personName}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant/70">
                          {token.completedAt || token.cancelledAt
                            ? new Date(token.completedAt || token.cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : ''}
                        </span>
                      </div>
                      <StatusBadge status={token.status} />
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
