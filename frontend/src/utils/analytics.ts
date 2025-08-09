// Google Analytics 4 Integration
// GDPR-compliant analytics with consent management

interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

interface GAEcommerce {
  currency: string;
  value: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    category?: string;
    quantity?: number;
    price?: number;
  }>;
}

class Analytics {
  private isInitialized = false;
  private consentGranted = false;
  private measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  constructor() {
    this.checkConsent();
    if (this.measurementId) {
      this.initializeGA();
    }
  }

  private checkConsent() {
    const consent = localStorage.getItem('cookieConsent');
    if (consent) {
      const preferences = JSON.parse(consent);
      this.consentGranted = preferences.analytics === true;
    }
  }

  private initializeGA() {
    if (!this.measurementId || this.isInitialized) return;

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.gtag = window.gtag || function() {
      (window.gtag as any).q = (window.gtag as any).q || [];
      (window.gtag as any).q.push(arguments);
    };

    window.gtag('js', new Date());

    // Configure with consent
    window.gtag('consent', 'default', {
      analytics_storage: this.consentGranted ? 'granted' : 'denied',
      ad_storage: 'denied', // We don't use ads
      wait_for_update: 500
    });

    // Initialize GA4
    window.gtag('config', this.measurementId, {
      send_page_view: this.consentGranted,
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: 'samesite=strict;secure'
    });

    this.isInitialized = true;
  }

  updateConsent(analyticsConsent: boolean) {
    this.consentGranted = analyticsConsent;
    
    if (window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: analyticsConsent ? 'granted' : 'denied'
      });
    }
    
    if (analyticsConsent && !this.isInitialized) {
      this.initializeGA();
    }
  }

  // Track page views
  pageView(path: string, title?: string) {
    if (!this.consentGranted || !window.gtag) return;

    window.gtag('config', this.measurementId!, {
      page_path: path,
      page_title: title
    });
  }

  // Track custom events
  event(eventData: GAEvent) {
    if (!this.consentGranted || !window.gtag) return;

    window.gtag('event', eventData.action, {
      event_category: eventData.category,
      event_label: eventData.label,
      value: eventData.value,
      ...eventData.custom_parameters
    });
  }

  // Track donations (ecommerce events)
  trackDonation(donationData: {
    amount: number;
    currency: string;
    referenceNumber: string;
    isAnonymous: boolean;
    referralCode?: string;
    country?: string;
  }) {
    if (!this.consentGranted || !window.gtag) return;

    // Purchase event for donation
    window.gtag('event', 'purchase', {
      transaction_id: donationData.referenceNumber,
      currency: donationData.currency,
      value: donationData.amount,
      items: [{
        item_id: 'donation',
        item_name: 'Donación El Día del Inmigrante 2026',
        category: 'donation',
        quantity: 1,
        price: donationData.amount
      }],
      custom_parameters: {
        donor_type: donationData.isAnonymous ? 'anonymous' : 'named',
        referral_code: donationData.referralCode || 'direct',
        donor_country: donationData.country || 'unknown'
      }
    });

    // Custom donation event
    this.event({
      action: 'donate',
      category: 'donations',
      label: donationData.referralCode || 'direct',
      value: donationData.amount,
      custom_parameters: {
        currency: donationData.currency,
        is_anonymous: donationData.isAnonymous,
        country: donationData.country
      }
    });
  }

  // Track referral clicks
  trackReferralClick(referralCode: string, source?: string) {
    this.event({
      action: 'referral_click',
      category: 'referrals',
      label: referralCode,
      custom_parameters: {
        source: source || 'unknown'
      }
    });
  }

  // Track referral code generation
  trackReferralGeneration(referralCode: string, name: string) {
    this.event({
      action: 'referral_created',
      category: 'referrals',
      label: referralCode,
      custom_parameters: {
        name: name
      }
    });
  }

  // Track form interactions
  trackFormStart(formName: string) {
    this.event({
      action: 'form_start',
      category: 'engagement',
      label: formName
    });
  }

  trackFormComplete(formName: string) {
    this.event({
      action: 'form_complete',
      category: 'engagement',
      label: formName
    });
  }

  trackFormError(formName: string, errorType: string) {
    this.event({
      action: 'form_error',
      category: 'engagement',
      label: formName,
      custom_parameters: {
        error_type: errorType
      }
    });
  }

  // Track social sharing
  trackSocialShare(platform: string, content: string) {
    this.event({
      action: 'share',
      category: 'social',
      label: platform,
      custom_parameters: {
        content_type: content
      }
    });
  }

  // Track file downloads
  trackDownload(fileName: string, fileType: string) {
    this.event({
      action: 'file_download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_type: fileType
      }
    });
  }

  // Track external links
  trackExternalLink(url: string, context?: string) {
    this.event({
      action: 'click',
      category: 'external_link',
      label: url,
      custom_parameters: {
        context: context || 'unknown'
      }
    });
  }

  // Track user engagement
  trackEngagement(action: string, element: string, value?: number) {
    this.event({
      action: action,
      category: 'user_engagement',
      label: element,
      value: value
    });
  }

  // Track errors
  trackError(errorMessage: string, errorLocation: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    this.event({
      action: 'error',
      category: 'technical',
      label: errorLocation,
      custom_parameters: {
        error_message: errorMessage,
        severity: severity
      }
    });
  }

  // Track performance metrics
  trackTiming(name: string, value: number, category: string = 'performance') {
    this.event({
      action: 'timing',
      category: category,
      label: name,
      value: value
    });
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;

// Utility hooks and functions for React components
export const usePageTracking = () => {
  const trackPage = (path: string, title?: string) => {
    analytics.pageView(path, title);
  };
  return trackPage;
};

// gtag interface is defined in types/global.d.ts