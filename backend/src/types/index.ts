export interface Donation {
  id: string;
  referenceNumber: string;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'rejected';
  isAnonymous: boolean;
  message?: string;
  referralId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: Date;
  confirmedAt?: Date;
  confirmedBy?: string;
}

export interface Referral {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  isActive: boolean;
  totalDonations: number;
  totalAmount: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface EventContent {
  id: string;
  section: string;
  title?: string;
  content?: string;
  imageUrl?: string;
  displayOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DonationGoal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  donationId: string;
  certificateNumber: string;
  donorName: string;
  amount: number;
  issuedAt: Date;
  pdfPath?: string;
}

export interface CreateDonationRequest {
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorCountry?: string;
  amount: number;
  isAnonymous: boolean;
  message?: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface CreateReferralRequest {
  name: string;
  email?: string;
  phone?: string;
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
    createdAt: Date;
    isAnonymous: boolean;
  }>;
}