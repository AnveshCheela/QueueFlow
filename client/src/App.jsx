import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import QueueDetailPage from './pages/QueueDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PublicDisplayPage from './pages/PublicDisplayPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import MobileStatusPage from './pages/MobileStatusPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue/:id"
            element={
              <ProtectedRoute>
                <QueueDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/queue/:id/dashboard"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/display/:queueId" element={<PublicDisplayPage />} />
          <Route path="/status/:queueId" element={<MobileStatusPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1b2120',
            color: '#dee4e1',
            border: '1px solid #3d4947',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#6bd8cb', secondary: '#003732' },
          },
          error: {
            iconTheme: { primary: '#ffb4ab', secondary: '#690005' },
          },
        }}
      />
    </AuthProvider>
  );
}
