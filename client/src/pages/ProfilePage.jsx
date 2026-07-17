import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/queues');
        setQueues(data.queues || data);
      } catch (err) {
        toast.error('Failed to load profile stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate totals
  const totalQueues = queues.length;
  let totalWaiting = 0;
  let totalServed = 0;
  
  queues.forEach(q => {
    totalWaiting += (q.waitingCount ?? q.tokens?.filter(t => t.status === 'waiting').length ?? 0);
    totalServed += (q.servedToday ?? q.tokens?.filter(t => t.status === 'completed').length ?? 0);
  });

  return (
    <div className="bg-background text-on-background min-h-screen relative overflow-x-hidden bg-mesh flex flex-col">
      <Navbar />

      <main className="flex-grow w-full max-w-[1000px] mx-auto px-6 py-12 pt-24">
        {/* Profile Header */}
        <div className="glass-panel rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden border-t border-primary/40 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="w-32 h-32 rounded-full bg-primary-container flex flex-shrink-0 items-center justify-center text-on-primary-container text-6xl font-black shadow-inner border-4 border-surface">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          
          <div className="flex flex-col text-center md:text-left flex-grow">
            <div className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Clinic Manager</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">{user?.name || 'Manager'}</h1>
            <div className="text-on-surface-variant flex items-center justify-center md:justify-start gap-2 text-lg">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              {user?.email || 'admin@clinic.com'}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 px-6 py-3 rounded-lg text-sm font-bold text-error bg-error-container/20 hover:bg-error-container hover:text-on-error-container transition-all cursor-pointer flex items-center gap-2 border border-error/30 uppercase tracking-wide"
          >
            <span className="material-symbols-outlined">logout</span>
            Log Out
          </button>
        </div>

        {/* Stats Grid */}
        <h2 className="text-2xl font-bold text-on-surface mb-6">Management Overview</h2>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Active Queues */}
            <div className="bg-surface-variant/40 border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between h-[160px] hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Active Queues</span>
                <span className="material-symbols-outlined text-primary text-[28px]">queue</span>
              </div>
              <div className="text-5xl font-black text-white">{totalQueues}</div>
            </div>

            {/* Total Waiting */}
            <div className="bg-surface-variant/40 border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between h-[160px] hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Patients Waiting</span>
                <span className="material-symbols-outlined text-white text-[28px]">hourglass_empty</span>
              </div>
              <div className="text-5xl font-black text-white">{totalWaiting}</div>
            </div>

            {/* Served Today */}
            <div className="bg-surface-variant/40 border border-outline-variant/30 rounded-xl p-6 flex flex-col justify-between h-[160px] hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start">
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Served Today</span>
                <span className="material-symbols-outlined text-white text-[28px]">check_circle</span>
              </div>
              <div className="text-5xl font-black text-white">{totalServed}</div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
