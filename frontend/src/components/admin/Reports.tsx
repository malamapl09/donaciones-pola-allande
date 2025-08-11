import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

interface ReportData {
  totalStats: {
    totalDonations: number;
    totalAmount: number;
    averageAmount: number;
    totalCountries: number;
  };
  statusBreakdown: {
    pending: number;
    confirmed: number;
    rejected: number;
  };
  monthlyStats: Array<{
    month: string;
    donations: number;
    amount: number;
  }>;
  countryStats: Array<{
    country: string;
    donations: number;
    amount: number;
  }>;
  referralStats: Array<{
    code: string;
    name: string;
    donations: number;
    amount: number;
  }>;
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const key = header.toLowerCase().replace(/ /g, '');
        return `"${row[key] || ''}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Error al cargar los datos del reporte</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600">
            Análisis detallado de las donaciones del evento
          </p>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen General' },
            { id: 'monthly', label: 'Estadísticas Mensuales' },
            { id: 'countries', label: 'Por Países' },
            { id: 'referrals', label: 'Referencias' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedReport === tab.id
                  ? 'border-pola-blue text-pola-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Total Donaciones</h3>
              <p className="text-3xl font-bold text-blue-700">{reportData.totalStats.totalDonations}</p>
            </div>
            <div className="card bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Total Recaudado</h3>
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(reportData.totalStats.totalAmount)}
              </p>
            </div>
            <div className="card bg-purple-50 border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Promedio por Donación</h3>
              <p className="text-3xl font-bold text-purple-700">
                {formatCurrency(reportData.totalStats.averageAmount)}
              </p>
            </div>
            <div className="card bg-orange-50 border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">Países Participantes</h3>
              <p className="text-3xl font-bold text-orange-700">{reportData.totalStats.totalCountries}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Donaciones</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{reportData.statusBreakdown.pending}</div>
                <div className="text-sm text-gray-600">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.statusBreakdown.confirmed}</div>
                <div className="text-sm text-gray-600">Confirmadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{reportData.statusBreakdown.rejected}</div>
                <div className="text-sm text-gray-600">Rechazadas</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report */}
      {selectedReport === 'monthly' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Estadísticas Mensuales</h3>
            <button
              onClick={() => exportToCSV(reportData.monthlyStats, 'estadisticas-mensuales', ['Month', 'Donations', 'Amount'])}
              className="btn-secondary text-sm"
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.monthlyStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.donations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(stat.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Countries Report */}
      {selectedReport === 'countries' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Donaciones por País</h3>
            <button
              onClick={() => exportToCSV(reportData.countryStats, 'donaciones-por-pais', ['Country', 'Donations', 'Amount'])}
              className="btn-secondary text-sm"
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    País
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.countryStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.country || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.donations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(stat.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Referrals Report */}
      {selectedReport === 'referrals' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Referencias</h3>
            <button
              onClick={() => exportToCSV(reportData.referralStats, 'referencias-performance', ['Code', 'Name', 'Donations', 'Amount'])}
              className="btn-secondary text-sm"
            >
              Exportar CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.referralStats.map((stat, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {stat.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stat.donations}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(stat.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;