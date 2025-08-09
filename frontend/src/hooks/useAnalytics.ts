import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import analytics from '../utils/analytics';

// Hook for automatic page tracking
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view on route changes
    const title = document.title;
    analytics.pageView(location.pathname + location.search, title);
  }, [location]);
};

// Hook for form tracking
export const useFormAnalytics = (formName: string) => {
  const trackStart = () => {
    analytics.trackFormStart(formName);
  };

  const trackComplete = () => {
    analytics.trackFormComplete(formName);
  };

  const trackError = (errorType: string) => {
    analytics.trackFormError(formName, errorType);
  };

  return {
    trackStart,
    trackComplete,
    trackError
  };
};

// Hook for donation tracking
export const useDonationAnalytics = () => {
  const trackDonationStart = () => {
    analytics.trackFormStart('donation_form');
  };

  const trackDonationComplete = (donationData: {
    amount: number;
    currency: string;
    referenceNumber: string;
    isAnonymous: boolean;
    referralCode?: string;
    country?: string;
  }) => {
    analytics.trackDonation(donationData);
    analytics.trackFormComplete('donation_form');
  };

  const trackDonationError = (errorType: string) => {
    analytics.trackFormError('donation_form', errorType);
  };

  return {
    trackDonationStart,
    trackDonationComplete,
    trackDonationError
  };
};

// Hook for referral tracking
export const useReferralAnalytics = () => {
  const trackReferralClick = (referralCode: string, source?: string) => {
    analytics.trackReferralClick(referralCode, source);
  };

  const trackReferralGeneration = (referralCode: string, name: string) => {
    analytics.trackReferralGeneration(referralCode, name);
  };

  return {
    trackReferralClick,
    trackReferralGeneration
  };
};

// Hook for engagement tracking
export const useEngagementAnalytics = () => {
  const trackClick = (element: string, context?: string) => {
    analytics.trackEngagement('click', element);
  };

  const trackScroll = (percentage: number) => {
    analytics.trackEngagement('scroll', 'page', percentage);
  };

  const trackTimeOnPage = (seconds: number) => {
    analytics.trackEngagement('time_on_page', 'page', seconds);
  };

  const trackSocialShare = (platform: string, content: string) => {
    analytics.trackSocialShare(platform, content);
  };

  return {
    trackClick,
    trackScroll,
    trackTimeOnPage,
    trackSocialShare
  };
};

// Hook for error tracking
export const useErrorAnalytics = () => {
  const trackError = (error: Error, context: string) => {
    analytics.trackError(error.message, context);
  };

  const trackApiError = (endpoint: string, status: number, message: string) => {
    analytics.trackError(`API ${status}: ${message}`, `api_${endpoint}`);
  };

  return {
    trackError,
    trackApiError
  };
};