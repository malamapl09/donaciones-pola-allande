export interface Donation {
  id: string;
  referenceNumber: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  isAnonymous: boolean;
  message?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  averageDonation: number;
  goalProgress: number;
  topCountries: Array<{
    country: string;
    count: number;
    amount: number;
  }>;
  recentDonations: Array<{
    amount: number;
    donorName?: string;
    createdAt: string;
    isAnonymous: boolean;
  }>;
}

export interface DonationGoal {
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  startDate?: string;
  endDate?: string;
}

export interface EventContent {
  [key: string]: {
    title?: string;
    content?: string;
    imageUrl?: string;
    displayOrder: number;
  };
}

export interface Referral {
  id: string;
  code: string;
  name: string;
  email?: string;
  totalDonations: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
  shareUrl: string;
  recentDonations: Array<{
    amount: number;
    donorName: string;
    createdAt: string;
    status: string;
  }>;
}

export interface CreateDonationData {
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  referralCode?: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}