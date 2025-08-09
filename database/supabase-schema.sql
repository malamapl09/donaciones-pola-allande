-- Donaciones Pola de Allande - Supabase Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[your-project]/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    total_donations INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by_ip INET,
    share_url TEXT
);

-- Create donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    donor_phone VARCHAR(20),
    donor_country VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'EUR',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    referral_id UUID REFERENCES referrals(id),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_by_ip INET
);

-- Create admin_users table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'moderator')),
    name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create event_content table
CREATE TABLE event_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(100) NOT NULL,
    title VARCHAR(500),
    content TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create donation_goals table
CREATE TABLE donation_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0.00,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create certificates table
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID NOT NULL REFERENCES donations(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    download_count INTEGER DEFAULT 0,
    last_downloaded TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_referral ON donations(referral_id);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_referrals_code ON referrals(code);
CREATE INDEX idx_certificates_donation ON certificates(donation_id);

-- Function to update referral totals
CREATE OR REPLACE FUNCTION update_referral_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.referral_id IS NOT NULL THEN
        UPDATE referrals 
        SET 
            total_donations = total_donations + 1,
            total_amount = total_amount + NEW.amount
        WHERE id = NEW.referral_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.referral_id IS NOT NULL THEN
        IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
            UPDATE referrals 
            SET 
                total_donations = total_donations + 1,
                total_amount = total_amount + NEW.amount
            WHERE id = NEW.referral_id;
        ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
            UPDATE referrals 
            SET 
                total_donations = total_donations - 1,
                total_amount = total_amount - NEW.amount
            WHERE id = NEW.referral_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for referral totals
CREATE TRIGGER trigger_update_referral_totals
    AFTER INSERT OR UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_totals();

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.status != NEW.status) THEN
        UPDATE donation_goals 
        SET current_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM donations 
            WHERE status = 'confirmed'
        )
        WHERE is_active = true;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for goal progress
CREATE TRIGGER trigger_update_goal_progress
    AFTER INSERT OR UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_goal_progress();

-- Enable Row Level Security (RLS) for better security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to necessary data
-- Referrals: Allow public read for active referrals
CREATE POLICY "Public referrals are viewable by everyone" ON referrals
    FOR SELECT USING (is_active = true);

-- Donations: Allow public insert (for new donations)
CREATE POLICY "Anyone can create donations" ON donations
    FOR INSERT WITH CHECK (true);

-- Event content: Allow public read for active content
CREATE POLICY "Public content is viewable by everyone" ON event_content
    FOR SELECT USING (is_active = true);

-- Donation goals: Allow public read for active goals
CREATE POLICY "Public goals are viewable by everyone" ON donation_goals
    FOR SELECT USING (is_active = true);

-- Note: Admin access should be handled by your backend authentication
-- For full admin access, you'll authenticate in your backend and use service role key

COMMENT ON TABLE referrals IS 'Referral tracking for donation campaigns';
COMMENT ON TABLE donations IS 'All donations made to the campaign';
COMMENT ON TABLE admin_users IS 'Administrative users for the system';
COMMENT ON TABLE event_content IS 'CMS content for the event pages';
COMMENT ON TABLE donation_goals IS 'Fundraising goals and progress tracking';
COMMENT ON TABLE certificates IS 'Digital certificates for donations';