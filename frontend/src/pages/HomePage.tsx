import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProgressBar from '../components/ProgressBar';
import SocialShare from '../components/SocialShare';
import { ScrollTracker } from '../components/TrackingComponents';
import { DonationGoal, DonationStats, EventContent } from '../types';
import { formatCurrency, formatDateShort, getReferralCode } from '../utils/helpers';
import { useReferralAnalytics, useEngagementAnalytics } from '../hooks/useAnalytics';
import { shareEventInfo } from '../utils/socialShare';

const HomePage: React.FC = () => {
  const { trackReferralClick } = useReferralAnalytics();
  const { trackClick } = useEngagementAnalytics();
  
  const [goal, setGoal] = useState<DonationGoal | null>(null);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [content, setContent] = useState<EventContent>({});
  const [loading, setLoading] = useState(true);
  const referralCode = getReferralCode();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalResponse, statsResponse, contentResponse] = await Promise.all([
          api.get('/content/goals'),
          api.get('/donations/stats'),
          api.get('/content')
        ]);

        setGoal(goalResponse.data);
        setStats(statsResponse.data);
        setContent(contentResponse.data);

        // Track referral landing if present
        if (referralCode) {
          trackReferralClick(referralCode, 'homepage_landing');
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [referralCode, trackReferralClick]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pola-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ScrollTracker />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pola-blue to-dominican-blue text-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-balance">
              {content.hero?.title || 'El Día del Inmigrante 2026'}
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto text-balance">
              {content.hero?.content || 'Únete a nosotros en la celebración del Día del Inmigrante 2026 en Pola de Allande'}
            </p>
            
            {referralCode && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm mb-2">Invitado por referencia:</p>
                <p className="font-semibold text-lg">{referralCode}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donar"
                className="bg-white text-pola-blue font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg"
              >
                Donar Ahora
              </Link>
              <Link
                to="/evento"
                className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-pola-blue transition-colors duration-200 text-lg"
              >
                Conoce el Evento
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section */}
      {goal && (
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ProgressBar
              current={goal.currentAmount}
              target={goal.targetAmount}
              title={goal.title}
              description={goal.description}
            />
          </div>
        </section>
      )}

      {/* Stats Section */}
      {stats && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Impacto hasta ahora
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card text-center">
                <div className="text-3xl font-bold text-pola-blue mb-2">
                  {formatCurrency(stats.totalAmount)}
                </div>
                <div className="text-gray-600">Total recaudado</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-dominican-red mb-2">
                  {stats.totalDonations}
                </div>
                <div className="text-gray-600">Donaciones</div>
              </div>
              
              <div className="card text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(stats.averageDonation)}
                </div>
                <div className="text-gray-600">Donación promedio</div>
              </div>
            </div>

            {/* Recent Donations */}
            {stats.recentDonations.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Donaciones Recientes</h3>
                <div className="space-y-3">
                  {stats.recentDonations.slice(0, 5).map((donation, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <span className="font-medium">
                          {donation.isAnonymous ? 'Donante Anónimo' : (donation.donorName || 'Donante Anónimo')}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">
                          {formatDateShort(donation.createdAt)}
                        </span>
                      </div>
                      <span className="font-semibold text-pola-blue">
                        {formatCurrency(donation.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* About Section */}
      {content.about && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {content.about.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {content.about.content}
            </p>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-dominican-red to-pola-red text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Tu donación marca la diferencia
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Cada contribución nos acerca más a hacer realidad este evento especial
          </p>
          <Link
            to="/donar"
            className="bg-white text-dominican-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg inline-block mb-8"
          >
            Contribuir Ahora
          </Link>
          
          {/* Social Share Section */}
          <div className="border-t border-red-400 pt-8">
            <h3 className="text-xl font-semibold mb-4 text-red-100">
              ¡Ayuda a difundir el evento!
            </h3>
            <p className="text-red-200 mb-6">
              Comparte con tus amigos y familiares la celebración del Día del Inmigrante 2026
            </p>
            <div className="flex justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <SocialShare
                  shareData={shareEventInfo()}
                  size="md"
                  showLabels={false}
                  platforms={['facebook', 'twitter', 'whatsapp', 'telegram', 'copy']}
                  className="justify-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;