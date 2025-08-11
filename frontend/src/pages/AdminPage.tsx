import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import LoginForm from '../components/admin/LoginForm';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../components/admin/Dashboard';
import DonationsList from '../components/admin/DonationsList';
import ReferralsList from '../components/admin/ReferralsList';
import Reports from '../components/admin/Reports';
import ContentManager from '../components/admin/ContentManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const AdminContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [loginSuccess, setLoginSuccess] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  if (!user && !loginSuccess) {
    return <LoginForm onSuccess={() => setLoginSuccess(true)} />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/donations" element={<DonationsList />} />
        <Route path="/referrals" element={<ReferralsList />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/content" element={<ContentManager />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </AdminLayout>
  );
};

const ComingSoonPage: React.FC<{ feature: string }> = ({ feature }) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {feature} - Próximamente
      </h2>
      <p className="text-gray-600">
        Esta funcionalidad estará disponible en una próxima actualización.
      </p>
    </div>
  );
};

const AdminPage: React.FC = () => {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
};

export default AdminPage;