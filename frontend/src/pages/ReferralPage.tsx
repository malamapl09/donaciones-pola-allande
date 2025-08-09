import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import SocialShare from '../components/SocialShare';
import { Referral } from '../types';
import { formatCurrency, formatDateShort, copyToClipboard } from '../utils/helpers';
import { shareReferralLink } from '../utils/socialShare';
import { useReferralAnalytics, useEngagementAnalytics } from '../hooks/useAnalytics';

const ReferralPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const { trackReferralClick } = useReferralAnalytics();
  const { trackClick, trackSocialShare } = useEngagementAnalytics();
  
  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const fetchReferral = async () => {
      if (!code) return;
      
      // Track referral page visit
      trackReferralClick(code, 'direct_link');
      
      try {
        const response = await api.get(`/referrals/${code}`);
        setReferral(response.data);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setError('Código de referencia no encontrado');
        } else {
          setError('Error al cargar la información de referencia');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReferral();
  }, [code, trackReferralClick]);

  const handleCopyLink = async () => {
    if (referral) {
      const success = await copyToClipboard(referral.shareUrl);
      if (success) {
        trackClick('copy_referral_link', `referral_${referral.code}`);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error}
            </h1>
            <p className="text-gray-600 mb-6">
              El código de referencia "{code}" no es válido o ha sido desactivado.
            </p>
            <Link to="/" className="btn-primary">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Referencia
          </h1>
          <p className="text-gray-600">
            Seguimiento de donaciones conseguidas por {referral.name}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-pola-blue mb-2">
              {formatCurrency(referral.totalAmount)}
            </div>
            <div className="text-gray-600">Total Recaudado</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-dominican-red mb-2">
              {referral.totalDonations}
            </div>
            <div className="text-gray-600">Donaciones</div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {referral.totalDonations > 0 ? formatCurrency(referral.totalAmount / referral.totalDonations) : '€0.00'}
            </div>
            <div className="text-gray-600">Promedio</div>
          </div>
        </div>

        {/* Referral Info */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Información del Enlace
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="label">Código de Referencia</label>
              <div className="bg-gray-50 rounded-lg p-3 font-mono text-lg">
                {referral.code}
              </div>
            </div>
            
            <div>
              <label className="label">Creado</label>
              <div className="bg-gray-50 rounded-lg p-3">
                {formatDateShort(referral.createdAt)}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Enlace para Compartir</label>
            <div className="flex">
              <input
                type="text"
                value={referral.shareUrl}
                readOnly
                className="input-field rounded-r-none"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-r-lg border-2 border-l-0 transition-colors duration-200 ${
                  copySuccess 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {copySuccess ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="mt-6">
            <label className="label">Compartir en Redes Sociales</label>
            <div className="bg-gray-50 rounded-lg p-4">
              <SocialShare
                shareData={shareReferralLink(referral.code, referral.name)}
                size="lg"
                showLabels={true}
                platforms={['facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'copy']}
                className="justify-center"
              />
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        {referral.recentDonations.length > 0 ? (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Donaciones Recientes
            </h2>
            <div className="space-y-4">
              {referral.recentDonations.map((donation, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">
                      {donation.donorName}
                    </span>
                    <span className="text-gray-500 text-sm ml-2">
                      {formatDateShort(donation.createdAt)}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        donation.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : donation.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {donation.status === 'confirmed' ? 'Confirmada' : 
                         donation.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-pola-blue text-lg">
                    {formatCurrency(donation.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aún no hay donaciones
            </h3>
            <p className="text-gray-600 mb-6">
              Comparte tu enlace para empezar a recibir donaciones
            </p>
            
            {/* Social Share Buttons for Empty State */}
            <div className="mb-6">
              <SocialShare
                shareData={shareReferralLink(referral.code, referral.name)}
                size="md"
                showLabels={false}
                platforms={['facebook', 'twitter', 'whatsapp', 'telegram', 'copy']}
                className="justify-center"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleCopyLink}
                className="btn-secondary"
              >
                Copiar Enlace
              </button>
              <Link
                to={`/donar?ref=${referral.code}`}
                className="btn-primary"
              >
                Hacer Primera Donación
              </Link>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            to={`/donar?ref=${referral.code}`}
            className="btn-primary text-lg px-8 py-3"
          >
            Donar con este Código
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;