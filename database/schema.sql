-- Database schema for Donaciones Pola de Allande
-- PostgreSQL

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: referrals
-- Stores referral codes and tracking information
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    total_donations INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0.00
);

-- Table: donations
-- Main donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    donor_phone VARCHAR(20),
    donor_country VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method VARCHAR(20) DEFAULT 'bank_transfer',
    status VARCHAR(20) DEFAULT 'pending',
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    referral_id UUID REFERENCES referrals(id),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    confirmed_by VARCHAR(255)
);

-- Table: admin_users
-- Administrative users
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: event_content
-- CMS-like content for event information
CREATE TABLE event_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    image_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: donation_goals
-- Fundraising goals and progress tracking
CREATE TABLE donation_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0.00,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: certificates
-- Digital certificates for donors
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donation_id UUID REFERENCES donations(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    pdf_path VARCHAR(500)
);

-- Indexes for performance
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
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'confirmed' AND NEW.referral_id IS NOT NULL THEN
        UPDATE referrals 
        SET 
            total_donations = total_donations + 1,
            total_amount = total_amount + NEW.amount
        WHERE id = NEW.referral_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update referral totals
CREATE TRIGGER trigger_update_referral_totals
    AFTER INSERT OR UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_referral_totals();

-- Function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' THEN
        UPDATE donation_goals 
        SET current_amount = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM donations 
            WHERE status = 'confirmed'
        )
        WHERE is_active = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update goal progress
CREATE TRIGGER trigger_update_goal_progress
    AFTER UPDATE ON donations
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmed')
    EXECUTE FUNCTION update_goal_progress();