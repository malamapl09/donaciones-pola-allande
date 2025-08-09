import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { EventContent } from '../types';

const AboutPage: React.FC = () => {
  const [content, setContent] = useState<EventContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await api.get('/content');
        setContent(response.data);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dominican-blue to-dominican-red text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">
            El Día del Inmigrante 2026
          </h1>
          <p className="text-xl text-blue-100">
            Celebrando a República Dominicana y su rica cultura
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* About Section */}
        {content.about && (
          <section className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {content.about.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {content.about.content}
            </p>
          </section>
        )}

        {/* Dominican Republic Section */}
        {content.dominican_republic && (
          <section className="card">
            <div className="flex items-center mb-4">
              <div className="w-8 h-5 mr-3 rounded">
                <div className="w-full h-1/2 bg-dominican-blue"></div>
                <div className="w-full h-1/2 bg-dominican-red"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {content.dominican_republic.title}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {content.dominican_republic.content}
            </p>
          </section>
        )}

        {/* Program Section */}
        {content.program && (
          <section className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {content.program.title}
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {content.program.content}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Actividades Previstas</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-dominican-red rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Música y Danza</h4>
                    <p className="text-gray-600 text-sm">Espectáculos de merengue, bachata y folclore dominicano</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-dominican-blue rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Gastronomía</h4>
                    <p className="text-gray-600 text-sm">Degustación de platos típicos dominicanos</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-dominican-red rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Exposiciones</h4>
                    <p className="text-gray-600 text-sm">Historia y cultura dominicana</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-dominican-blue rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Actividades Familiares</h4>
                    <p className="text-gray-600 text-sm">Juegos y talleres para toda la familia</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* How to Donate Section */}
        {content.donate && (
          <section className="card bg-gradient-to-r from-pola-blue to-dominican-blue text-white">
            <h2 className="text-2xl font-bold mb-4">
              {content.donate.title}
            </h2>
            <p className="leading-relaxed mb-6">
              {content.donate.content}
            </p>
            <a
              href="/donar"
              className="inline-block bg-white text-pola-blue font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Donar Ahora
            </a>
          </section>
        )}

        {/* Event Details */}
        <section className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Detalles del Evento</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Fecha y Lugar</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Mayo 2026 (fecha exacta por confirmar)
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pola de Allande, Asturias, España
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contacto</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  donaciones@polaallande.org
                </p>
                <p className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Asociación Cultural Pola de Allande
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;