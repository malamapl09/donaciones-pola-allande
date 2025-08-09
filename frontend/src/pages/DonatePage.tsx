import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SocialShare from '../components/SocialShare';
import { CreateDonationData } from '../types';
import { validateEmail, validatePhone, getReferralCode, getUTMParams } from '../utils/helpers';
import { useDonationAnalytics, useErrorAnalytics } from '../hooks/useAnalytics';
import { shareDonationSuccess } from '../utils/socialShare';

const DonatePage: React.FC = () => {
  const navigate = useNavigate();
  const { trackDonationStart, trackDonationComplete, trackDonationError } = useDonationAnalytics();
  const { trackApiError } = useErrorAnalytics();
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [donationResult, setDonationResult] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const [formData, setFormData] = useState<CreateDonationData>({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorCountry: '',
    amount: 0,
    isAnonymous: false,
    message: '',
    referralCode: getReferralCode() || undefined,
    ...getUTMParams()
  });

  const [bankInfo, setBankInfo] = useState<string>('');

  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        const response = await api.get('/content/section/bank_info');
        setBankInfo(response.data.content);
      } catch (error) {
        console.error('Error fetching bank info:', error);
      }
    };

    fetchBankInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.isAnonymous) {
      if (!formData.donorName?.trim()) {
        newErrors.donorName = 'El nombre es requerido para donaciones no anónimas';
      }

      if (formData.donorEmail && !validateEmail(formData.donorEmail)) {
        newErrors.donorEmail = 'Email inválido';
      }

      if (formData.donorPhone && !validatePhone(formData.donorPhone)) {
        newErrors.donorPhone = 'Teléfono inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      trackDonationError('validation_failed');
      return;
    }

    setLoading(true);
    trackDonationStart();

    try {
      const response = await api.post('/donations', formData);
      const donationData = response.data.donation;
      
      // Track successful donation
      trackDonationComplete({
        amount: donationData.amount,
        currency: 'EUR',
        referenceNumber: donationData.referenceNumber,
        isAnonymous: formData.isAnonymous,
        referralCode: formData.referralCode,
        country: formData.donorCountry
      });
      
      setDonationResult(response.data);
      setSuccess(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al procesar la donación';
      
      // Track API error
      trackApiError('donations', error.response?.status || 500, errorMessage);
      trackDonationError('api_error');
      
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else {
        setErrors({ general: 'Error al procesar la donación. Inténtalo de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success && donationResult) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Donación Registrada!
              </h1>
              <p className="text-gray-600">
                Tu donación ha sido registrada exitosamente
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Número de Referencia</h3>
              <p className="text-2xl font-mono font-bold text-blue-700">
                {donationResult.donation.referenceNumber}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Guarda este número para hacer seguimiento de tu donación
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-3">
                Instrucciones de Transferencia Bancaria
              </h3>
              <div className="text-left text-sm text-yellow-800 whitespace-pre-line">
                {donationResult.bankTransferInfo}
              </div>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600">
                <strong>Importante:</strong> Una vez realizada la transferencia, envía el comprobante 
                a donaciones@polaallande.org junto con tu número de referencia.
              </p>
              
              {/* Social Share Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-center">
                  ¡Comparte tu contribución!
                </h3>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Ayuda a difundir el evento y anima a otros a participar
                </p>
                <SocialShare
                  shareData={shareDonationSuccess(
                    donationResult.donation.amount,
                    donationResult.donation.referenceNumber
                  )}
                  size="md"
                  showLabels={false}
                  platforms={['facebook', 'twitter', 'whatsapp', 'telegram', 'copy']}
                  className="justify-center"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-secondary"
                >
                  Hacer Otra Donación
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="btn-primary"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Realizar Donación
          </h1>
          <p className="text-lg text-gray-600">
            Tu contribución ayuda a hacer posible El Día del Inmigrante 2026
          </p>
        </div>

        {formData.referralCode && (
          <div className="card mb-6 border-pola-blue">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pola-blue rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-pola-blue">Donación por Referencia</h3>
                <p className="text-gray-600">Código: {formData.referralCode}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="label">Monto de Donación (EUR) *</label>
            <input
              type="number"
              name="amount"
              min="1"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleInputChange}
              className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
              required
            />
            {errors.amount && <p className="error-text">{errors.amount}</p>}
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="w-4 h-4 text-pola-blue focus:ring-pola-blue border-gray-300 rounded"
            />
            <label htmlFor="isAnonymous" className="text-gray-700 cursor-pointer">
              Donación anónima (no se mostrará tu nombre públicamente)
            </label>
          </div>

          {/* Personal Information */}
          {!formData.isAnonymous && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Información Personal
              </h3>
              
              <div>
                <label className="label">Nombre Completo *</label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName || ''}
                  onChange={handleInputChange}
                  className={`input-field ${errors.donorName ? 'border-red-500' : ''}`}
                  required={!formData.isAnonymous}
                />
                {errors.donorName && <p className="error-text">{errors.donorName}</p>}
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="donorEmail"
                  value={formData.donorEmail || ''}
                  onChange={handleInputChange}
                  className={`input-field ${errors.donorEmail ? 'border-red-500' : ''}`}
                />
                {errors.donorEmail && <p className="error-text">{errors.donorEmail}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  Para recibir actualizaciones sobre el evento
                </p>
              </div>

              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  name="donorPhone"
                  value={formData.donorPhone || ''}
                  onChange={handleInputChange}
                  className={`input-field ${errors.donorPhone ? 'border-red-500' : ''}`}
                />
                {errors.donorPhone && <p className="error-text">{errors.donorPhone}</p>}
              </div>

              <div>
                <label className="label">País</label>
                <select
                  name="donorCountry"
                  value={formData.donorCountry || ''}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Selecciona tu país</option>
                  <option value="España">España</option>
                  <option value="República Dominicana">República Dominicana</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Francia">Francia</option>
                  <option value="Alemania">Alemania</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="label">Mensaje (Opcional)</label>
            <textarea
              name="message"
              rows={4}
              value={formData.message || ''}
              onChange={handleInputChange}
              className="input-field"
              placeholder="Comparte un mensaje de apoyo..."
            />
          </div>

          {/* Bank Info Preview */}
          {bankInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Información Bancaria
              </h3>
              <div className="text-sm text-blue-800 whitespace-pre-line">
                {bankInfo}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full btn-primary py-3 text-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Procesando...' : 'Registrar Donación'}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Al continuar, recibirás las instrucciones para realizar la transferencia bancaria.
            Tu donación será confirmada una vez procesada la transferencia.
          </p>
        </form>
      </div>
    </div>
  );
};

export default DonatePage;