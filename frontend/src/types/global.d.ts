declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'consent' | 'event' | 'js',
      targetId: string | 'update' | 'default' | Date,
      config?: any
    ) => void;
    dataLayer?: any[];
  }
}

export {};