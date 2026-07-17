import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (regPassword !== regConfirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword);
      toast.success('Account created successfully!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Blob */}
      <div className="bg-blob" />

      {/* Top Header */}
      <header className="bg-transparent flex items-center w-full px-6 py-4 max-w-[1440px] mx-auto relative z-10 gap-2">
        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>all_inclusive</span>
        <div className="text-primary text-2xl font-bold tracking-tight">QueueFlow</div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="glass-panel w-full max-w-md rounded-xl p-12 flex flex-col gap-6 border-t border-outline-variant">
          {/* Header & Tabs */}
          <div className="flex flex-col items-center gap-4 mb-4">
            <h1 className="text-3xl font-semibold text-on-surface text-center">
              {activeTab === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-sm text-on-surface-variant text-center">
              Secure access to clinical systems.
            </p>
            <div className="flex w-full mt-2 border-b border-surface-variant">
              <button
                onClick={() => setActiveTab('signin')}
                className={`flex-1 py-2 text-xl font-semibold pb-2 transition-colors cursor-pointer bg-transparent border-0 ${
                  activeTab === 'signin'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 py-2 text-xl font-semibold pb-2 transition-colors cursor-pointer bg-transparent border-0 ${
                  activeTab === 'signup'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    mail
                  </span>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="input-field w-full rounded-lg py-2 pl-12 pr-2 text-base"
                    placeholder="admin@clinic.com"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    lock
                  </span>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="input-field w-full rounded-lg py-2 pl-12 pr-2 text-base"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full rounded-lg py-2 mt-2 text-xl font-semibold flex justify-center items-center gap-1 cursor-pointer disabled:opacity-50 border-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Access Portal
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    person
                  </span>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="input-field w-full rounded-lg py-2 pl-12 pr-2 text-base"
                    placeholder="Dr. Jane Doe"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    mail
                  </span>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="input-field w-full rounded-lg py-2 pl-12 pr-2 text-base"
                    placeholder="jane@clinic.com"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    lock
                  </span>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="input-field w-full rounded-lg py-2 pl-12 pr-2 text-base"
                    placeholder="Create password"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    lock
                  </span>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className="input-field w-full rounded-lg py-2 pl-12 pr-2 text-base"
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gradient w-full rounded-lg py-2 mt-2 text-xl font-semibold flex justify-center items-center gap-1 cursor-pointer disabled:opacity-50 border-0"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined">person_add</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
