import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

interface Donation {
  id: string;
  referenceNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorCountry: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  isAnonymous: boolean;
  message: string;
  createdAt: string;
  confirmedAt: string;
  confirmedBy: string;
  referralCode: string;
  referralName: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface DonationsResponse {
  donations: Donation[];
  pagination: PaginationInfo;
}

const DonationsList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<DonationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get('page') || '1');
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    fetchDonations();
  }, [searchParams]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await api.get(`/admin/donations?${params}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDonationStatus = async (donationId: string, newStatus: 'confirmed' | 'rejected') => {
    setUpdatingStatus(donationId);
    try {
      await api.patch(`/admin/donations/${donationId}/status`, { status: newStatus });
      await fetchDonations(); // Refresh the list
    } catch (error) {
      console.error('Error updating donation status:', error);
      alert('Error al actualizar el estado de la donación');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleStatusFilterChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar las donaciones</p>
      </div>
    );
  }

  const { donations, pagination } = data;

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Donaciones</h1>
          <p className="text-gray-600">
            {pagination.total} donaciones en total
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="input-field min-w-0"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>
      </div>

      {/* Donations Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donations.map((donation) => (
                <tr key={donation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.donorName}
                      </div>
                      {donation.donorEmail && (
                        <div className="text-sm text-gray-500">
                          {donation.donorEmail}
                        </div>
                      )}
                      {donation.donorCountry && (
                        <div className="text-xs text-gray-400">
                          {donation.donorCountry}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">
                      {donation.referenceNumber}
                    </div>
                    {donation.referralCode && (
                      <div className="text-xs text-blue-600">
                        Ref: {donation.referralCode}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(donation.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(donation.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {donation.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateDonationStatus(donation.id, 'confirmed')}
                          disabled={updatingStatus === donation.id}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateDonationStatus(donation.id, 'rejected')}
                          disabled={updatingStatus === donation.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                    {donation.status !== 'pending' && donation.confirmedAt && (
                      <div className="text-xs text-gray-500">
                        {donation.status === 'confirmed' ? 'Confirmada' : 'Rechazada'} el{' '}
                        {formatDate(donation.confirmedAt)}
                        {donation.confirmedBy && (
                          <div>por {donation.confirmedBy}</div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {donations.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay donaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter ? `No se encontraron donaciones con estado "${statusFilter}"` : 'No se encontraron donaciones'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsList;