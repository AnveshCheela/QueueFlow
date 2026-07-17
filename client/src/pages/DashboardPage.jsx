import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
  const [creating, setCreating] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  const fetchQueues = async () => {
    try {
      const { data } = await api.get('/queues');
      setQueues(data.queues || data);
    } catch (err) {
      toast.error('Failed to load queues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const handleCreateQueue = async (e) => {
    e.preventDefault();
    if (!newQueueName.trim()) {
      toast.error('Please enter a queue name');
      return;
    }
    setCreating(true);
    try {
      await api.post('/queues', { name: newQueueName.trim() });
      toast.success('Queue created!');
      setNewQueueName('');
      setModalOpen(false);
      fetchQueues();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create queue');
    } finally {
      setCreating(false);
    }
  };

  const getQueueColor = (queue) => {
    const waitingCount = queue.waitingCount ?? queue.tokens?.filter(t => t.status === 'waiting').length ?? 0;
    if (waitingCount >= 15) return { bar: 'bg-on-surface', dot: 'bg-on-surface', shadow: 'shadow-[0_0_8px_rgba(255,255,255,0.6)]', text: 'text-on-surface', label: 'Busy', numColor: 'text-white' };
    return { bar: 'bg-on-surface-variant', dot: 'bg-on-surface-variant', shadow: 'shadow-[0_0_8px_rgba(163,163,163,0.4)]', text: 'text-on-surface-variant', label: 'Active', numColor: 'text-on-surface-variant' };
  };

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-x-hidden bg-mesh">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-6 py-12 pt-20">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-white tracking-tight">Active Queues</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/global-display"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 uppercase tracking-wider flex items-center gap-2 transition-colors border border-white/20"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>desktop_windows</span>
              Global TV Display
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="gradient-btn px-6 py-2 rounded-lg text-xs font-semibold text-background uppercase tracking-wider flex items-center gap-1 cursor-pointer border-0"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              Create Queue
            </button>
          </div>
        </header>

        {/* Queue Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : queues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/40">queue</span>
            <p className="text-on-surface-variant text-lg">No queues yet. Create your first queue to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {queues.map((queue) => {
              const colors = getQueueColor(queue);
              const waitingCount = queue.waitingCount ?? queue.tokens?.filter(t => t.status === 'waiting').length ?? 0;
              const servedCount = queue.servedToday ?? queue.tokens?.filter(t => t.status === 'completed').length ?? 0;

              return (
                <div
                  key={queue._id}
                  onClick={() => navigate(`/queue/${queue._id}`)}
                  className="glass-panel rounded-xl p-6 relative overflow-hidden flex flex-col justify-between h-[200px] transition-all cursor-pointer group"
                >
                  {/* Left color bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-[4px] ${colors.bar}`} />

                  {/* Top section */}
                  <div className="flex justify-between items-start pl-2">
                    <div>
                      <h2 className="text-2xl font-semibold text-on-surface mb-1">{queue.name}</h2>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${colors.dot} ${colors.shadow}`} />
                        <span className={`text-xs font-semibold ${colors.text} uppercase`}>{colors.label}</span>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setOpenDropdown(openDropdown === queue._id ? null : queue._id); 
                        }}
                        className="text-on-surface-variant group-hover:text-primary transition-colors bg-transparent border-0 cursor-pointer p-1 rounded-full hover:bg-surface-variant/30 flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                      
                      {openDropdown === queue._id && (
                        <div 
                          className="absolute right-0 top-8 bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-xl overflow-hidden z-20 min-w-[180px] flex flex-col"
                        >
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              navigate(`/display/${queue._id}`); 
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3 border-0 bg-transparent cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px] text-primary">desktop_windows</span>
                            Public Display
                          </button>
                          <div className="h-[1px] bg-outline-variant/30 w-full" />
                          <button
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              setOpenDropdown(null);
                              if(window.confirm('Are you sure you want to delete this queue? This cannot be undone.')) {
                                try {
                                  await api.delete(`/queues/${queue._id}`);
                                  toast.success('Queue deleted');
                                  fetchQueues();
                                } catch(err) { 
                                  toast.error('Failed to delete queue'); 
                                }
                              }
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-error hover:bg-error-container/20 transition-colors flex items-center gap-3 border-0 bg-transparent cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete Queue
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom section */}
                  <div className="flex justify-between items-end pl-2 mt-4">
                    <div>
                      <div className="text-xs font-semibold text-on-surface-variant uppercase mb-1 tracking-widest">
                        People Waiting
                      </div>
                      <div className={`text-5xl font-bold ${colors.numColor} leading-none tracking-tight`}>
                        {waitingCount}
                      </div>
                    </div>
                    <div className="text-sm text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      {servedCount} served today
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Queue Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Queue">
        <form onSubmit={handleCreateQueue}>
          <div className="p-6">
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
              Queue Name
            </label>
            <input
              type="text"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              className="input-field w-full rounded-lg px-4 py-2 text-base"
              placeholder="e.g. OPD Counter 1"
              autoFocus
            />
          </div>
          <div className="flex justify-end items-center gap-2 p-6 border-t border-outline-variant/30 bg-surface-container-low/50">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-on-surface-variant bg-transparent border border-outline-variant/50 hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="btn-gradient px-4 py-2 rounded-lg text-xs font-semibold border-0 cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              {creating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Queue'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Footer />
    </div>
  );
}
