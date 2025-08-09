import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDateShort, copyToClipboard } from '../../utils/helpers';

interface ReferralStats {
  code: string;
  name: string;
  totalDonations: number;
  totalAmount: number;
  createdAt: string;
}

const ReferralsList: React.FC = () => {
  const [referrals, setReferrals] = useState<ReferralStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        const response = await api.get('/referrals');
        setReferrals(response.data.leaderboard || []);
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleCopyLink = async (code: string) => {
    const url = `${window.location.origin}?ref=${code}`;
    const success = await copyToClipboard(url);
    if (success) {
      setCopySuccess(code);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Códigos de Referencia</h1>
        <p className="text-gray-600">
          {referrals.length} códigos activos
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Embajador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Recaudado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.map((referral, index) => (
                <tr key={referral.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pola-blue to-dominican-blue flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {referral.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{index + 1} en ranking
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {referral.code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-pola-blue">
                      {formatCurrency(referral.totalAmount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {referral.totalDonations}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateShort(referral.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopyLink(referral.code)}
                        className={`px-3 py-1 rounded text-xs transition-colors duration-200 ${
                          copySuccess === referral.code
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {copySuccess === referral.code ? 'Copiado!' : 'Copiar Enlace'}
                      </button>
                      <a
                        href={`/referencia/${referral.code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-xs transition-colors duration-200"
                      >
                        Ver Panel
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {referrals.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay códigos de referencia</h3>
            <p className="mt-1 text-sm text-gray-500">
              Los códigos aparecerán aquí cuando se generen desde el sitio público
            </p>
          </div>
        )}
      </div>

      {referrals.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Referencias</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-pola-blue">
                {referrals.reduce((sum, ref) => sum + ref.totalDonations, 0)}
              </div>
              <div className="text-gray-600">Total de Donaciones por Referencias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(referrals.reduce((sum, ref) => sum + ref.totalAmount, 0))}
              </div>
              <div className="text-gray-600">Total Recaudado por Referencias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-dominican-red">
                {referrals.length > 0 ? 
                  formatCurrency(referrals.reduce((sum, ref) => sum + ref.totalAmount, 0) / referrals.reduce((sum, ref) => sum + ref.totalDonations, 0)) 
                  : '€0.00'
                }
              </div>
              <div className="text-gray-600">Donación Promedio por Referencia</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralsList;