import React, { useEffect, useState } from 'react';
import analytics from '../utils/analytics';

// Analytics dashboard component for admin use
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: string;
}

const AnalyticsDashboard: React.FC = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if analytics is enabled
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      const preferences = JSON.parse(consent);
      setIsEnabled(preferences.analytics === true);
    }
  }, []);

  const testAnalyticsEvents = () => {
    // Test various analytics events
    analytics.event({
      action: 'test_event',
      category: 'admin_test',
      label: 'dashboard_test',
      value: 1
    });

    analytics.trackEngagement('test_click', 'analytics_dashboard');
    
    analytics.trackTiming('page_load', 1234, 'performance');
  };

  if (!isEnabled) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Analytics Dashboard
        </h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-yellow-800 font-medium">Analytics deshabilitado</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Las cookies de analytics no están habilitadas. Las métricas de Google Analytics 4 no se están recopilando.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Google Analytics 4 - Estado
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-green-600">Activo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900">Medición ID</h4>
            <p className="text-blue-700 text-sm font-mono">
              {import.meta.env.VITE_GA_MEASUREMENT_ID || 'No configurado'}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900">Consentimiento</h4>
            <p className="text-green-700 text-sm">Analytics: ✓ Concedido</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-900">GDPR</h4>
            <p className="text-purple-700 text-sm">IP Anonimizada: ✓</p>
          </div>
        </div>

        <button
          onClick={testAnalyticsEvents}
          className="btn-primary mb-4"
        >
          Probar Eventos de Analytics
        </button>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Eventos Configurados
        </h3>

        <div className="space-y-3">
          {[
            { name: 'Donaciones', description: 'purchase, donate - Seguimiento de donaciones completadas' },
            { name: 'Referencias', description: 'referral_click, referral_created - Sistema de referencias' },
            { name: 'Formularios', description: 'form_start, form_complete, form_error - Interacciones con formularios' },
            { name: 'Engagement', description: 'click, scroll, time_on_page - Métricas de engagement' },
            { name: 'Social', description: 'share - Compartir en redes sociales' },
            { name: 'Errores', description: 'error - Seguimiento de errores técnicos' },
            { name: 'Performance', description: 'timing - Métricas de rendimiento' }
          ].map((event, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{event.name}</h4>
                  <p className="text-gray-600 text-sm">{event.description}</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración Recomendada
        </h3>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Variables de Entorno</h4>
          <pre className="text-blue-800 text-sm bg-blue-100 p-2 rounded overflow-x-auto">
{`VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`}
          </pre>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">Configuración GA4</h4>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Conversiones: Configurar "purchase" como evento de conversión</li>
            <li>• Audiencias: Crear segmentos por referral_code</li>
            <li>• Embudos: Configurar embudo form_start → form_complete → purchase</li>
            <li>• Atribuciones: Usar modelo last-click para referencias</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;