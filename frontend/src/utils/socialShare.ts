// Social media sharing utilities with analytics tracking
import analytics from './analytics';

export interface ShareData {
  url: string;
  title: string;
  description?: string;
  hashtags?: string[];
  via?: string;
  image?: string;
}

export interface ShareOptions {
  trackEvent?: boolean;
  windowOptions?: string;
  fallbackUrl?: string;
}

class SocialShare {
  private defaultWindowOptions = 'width=600,height=400,scrollbars=no,resizable=no';

  // Facebook sharing
  shareOnFacebook(data: ShareData, options: ShareOptions = {}) {
    const params = new URLSearchParams({
      u: data.url,
      quote: data.description || data.title
    });

    const shareUrl = `https://www.facebook.com/sharer/sharer.php?${params}`;
    
    if (options.trackEvent !== false) {
      analytics.trackSocialShare('facebook', 'referral_link');
    }

    return this.openShareWindow(shareUrl, options.windowOptions);
  }

  // Twitter/X sharing
  shareOnTwitter(data: ShareData, options: ShareOptions = {}) {
    const text = data.description || data.title;
    const hashtags = data.hashtags ? data.hashtags.join(',') : '';
    
    const params = new URLSearchParams({
      url: data.url,
      text: text,
      ...(hashtags && { hashtags }),
      ...(data.via && { via: data.via })
    });

    const shareUrl = `https://twitter.com/intent/tweet?${params}`;
    
    if (options.trackEvent !== false) {
      analytics.trackSocialShare('twitter', 'referral_link');
    }

    return this.openShareWindow(shareUrl, options.windowOptions);
  }

  // LinkedIn sharing
  shareOnLinkedIn(data: ShareData, options: ShareOptions = {}) {
    const params = new URLSearchParams({
      url: data.url,
      title: data.title,
      summary: data.description || '',
      source: window.location.hostname
    });

    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?${params}`;
    
    if (options.trackEvent !== false) {
      analytics.trackSocialShare('linkedin', 'referral_link');
    }

    return this.openShareWindow(shareUrl, options.windowOptions);
  }

  // WhatsApp sharing
  shareOnWhatsApp(data: ShareData, options: ShareOptions = {}) {
    const text = `${data.title}\n\n${data.description || ''}\n\n${data.url}`.trim();
    
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    
    if (options.trackEvent !== false) {
      analytics.trackSocialShare('whatsapp', 'referral_link');
    }

    // WhatsApp works better as a direct link rather than popup
    window.open(shareUrl, '_blank');
    return Promise.resolve(true);
  }

  // Telegram sharing
  shareOnTelegram(data: ShareData, options: ShareOptions = {}) {
    const params = new URLSearchParams({
      url: data.url,
      text: data.title + (data.description ? `\n\n${data.description}` : '')
    });

    const shareUrl = `https://t.me/share/url?${params}`;
    
    if (options.trackEvent !== false) {
      analytics.trackSocialShare('telegram', 'referral_link');
    }

    return this.openShareWindow(shareUrl, options.windowOptions);
  }

  // Email sharing
  shareByEmail(data: ShareData, options: ShareOptions = {}) {
    const subject = encodeURIComponent(data.title);
    const body = encodeURIComponent(
      `${data.description || data.title}\n\n${data.url}\n\n` +
      `Enviado desde ${window.location.hostname}`
    );

    const shareUrl = `mailto:?subject=${subject}&body=${body}`;
    
    if (options.trackEvent !== false) {
      analytics.trackSocialShare('email', 'referral_link');
    }

    window.location.href = shareUrl;
    return Promise.resolve(true);
  }

  // Generic copy to clipboard
  async copyToClipboard(data: ShareData, options: ShareOptions = {}) {
    const textToCopy = `${data.title}\n\n${data.description || ''}\n\n${data.url}`.trim();
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      
      if (options.trackEvent !== false) {
        analytics.trackSocialShare('clipboard', 'referral_link');
      }
      
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  // Native Web Share API (mobile)
  async nativeShare(data: ShareData, options: ShareOptions = {}) {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url
      });
      
      if (options.trackEvent !== false) {
        analytics.trackSocialShare('native_share', 'referral_link');
      }
      
      return true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
      return false;
    }
  }

  // Open share window helper
  private openShareWindow(url: string, windowOptions?: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const popup = window.open(
          url, 
          'share-popup', 
          windowOptions || this.defaultWindowOptions
        );
        
        if (popup) {
          // Check if popup was closed (user completed or cancelled sharing)
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              resolve(true);
            }
          }, 1000);
          
          // Auto-resolve after 30 seconds
          setTimeout(() => {
            clearInterval(checkClosed);
            resolve(true);
          }, 30000);
        } else {
          resolve(false);
        }
      } catch (error) {
        console.error('Error opening share window:', error);
        resolve(false);
      }
    });
  }

  // Check if platform is available
  isNativeShareAvailable(): boolean {
    return 'share' in navigator;
  }

  isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}

// Create singleton instance
const socialShare = new SocialShare();

export default socialShare;

// Utility functions for common sharing scenarios
export const shareReferralLink = (referralCode: string, referralName: string) => {
  const url = `${window.location.origin}?ref=${referralCode}`;
  const title = `¡Únete a la donación para El Día del Inmigrante 2026!`;
  const description = `${referralName} te invita a participar en la donación para el evento "El Día del Inmigrante 2026" en Pola de Allande, homenajeando a República Dominicana. Tu contribución hace la diferencia.`;
  
  return {
    url,
    title,
    description,
    hashtags: ['DiadelInmigrante2026', 'PolaDeAllande', 'RepublicaDominicana', 'Donaciones'],
    via: 'PolaAllande'
  };
};

export const shareEventInfo = () => {
  const url = `${window.location.origin}/evento`;
  const title = `El Día del Inmigrante 2026 - República Dominicana`;
  const description = `Descubre todo sobre el evento "El Día del Inmigrante 2026" en Pola de Allande, donde rendimos homenaje a República Dominicana y su rica cultura.`;
  
  return {
    url,
    title,
    description,
    hashtags: ['DiadelInmigrante2026', 'PolaDeAllande', 'RepublicaDominicana', 'CulturaLatina'],
    via: 'PolaAllande'
  };
};

export const shareDonationSuccess = (amount: number, referenceNumber: string) => {
  const url = window.location.origin;
  const title = `¡He contribuido al Día del Inmigrante 2026!`;
  const description = `Acabo de hacer una donación para apoyar el evento "El Día del Inmigrante 2026" en Pola de Allande. ¡Únete tú también y ayudemos a hacer este evento realidad!`;
  
  return {
    url,
    title,
    description,
    hashtags: ['DiadelInmigrante2026', 'Donacion', 'PolaDeAllande', 'Solidaridad'],
    via: 'PolaAllande'
  };
};