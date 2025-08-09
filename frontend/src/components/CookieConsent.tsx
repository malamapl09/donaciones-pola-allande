import React, { useState, useEffect } from 'react';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC<CookieConsentProps> = ({ onAccept }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPreferences = {
      essential: true,
      analytics: true,
      marketing: true
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allPreferences));
    onAccept(allPreferences);
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    onAccept(preferences);
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false
    };
    localStorage.setItem('cookieConsent', JSON.stringify(essentialOnly));
    onAccept(essentialOnly);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            🍪 Preferencias de Cookies
          </h2>
          
          <p className="text-gray-600 mb-4 text-sm">
            Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. 
            Puedes gestionar tus preferencias de cookies seleccionando las categorías a continuación.
          </p>

          {!showDetails ? (
            <div className="space-y-3">
              <button
                onClick={() => setShowDetails(true)}
                className="text-pola-blue hover:underline text-sm"
              >
                Ver detalles y configurar preferencias
              </button>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="btn-primary flex-1"
                >
                  Aceptar Todas
                </button>
                <button
                  onClick={handleRejectAll}
                  className="btn-secondary flex-1"
                >
                  Solo Esenciales
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Cookies Esenciales</h3>
                    <p className="text-xs text-gray-600">
                      Necesarias para el funcionamiento básico del sitio web
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-4 h-4 text-pola-blue bg-gray-100 border-gray-300 rounded focus:ring-pola-blue"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Cookies de Análisis</h3>
                    <p className="text-xs text-gray-600">
                      Nos ayudan a entender cómo interactúas con el sitio web
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      analytics: e.target.checked 
                    }))}
                    className="w-4 h-4 text-pola-blue bg-gray-100 border-gray-300 rounded focus:ring-pola-blue"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Cookies de Marketing</h3>
                    <p className="text-xs text-gray-600">
                      Utilizadas para personalizar contenido y anuncios
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({ 
                      ...prev, 
                      marketing: e.target.checked 
                    }))}
                    className="w-4 h-4 text-pola-blue bg-gray-100 border-gray-300 rounded focus:ring-pola-blue"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptSelected}
                  className="btn-primary flex-1"
                >
                  Guardar Preferencias
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn-secondary flex-1"
                >
                  Volver
                </button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>
                  Para más información, consulta nuestra{' '}
                  <a href="/api/privacy/policy" className="text-pola-blue hover:underline">
                    Política de Privacidad
                  </a>
                </p>
                <p>
                  Puedes cambiar estas preferencias en cualquier momento desde el pie de página.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;