import { Request, Response, NextFunction } from 'express';
import pool from '../utils/database';

export const gdprCompliance = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Privacy-Policy', 'https://polaallande.org/privacy');
  res.setHeader('X-GDPR-Compliant', 'true');
  next();
};

export const anonymizePersonalData = (data: any): any => {
  if (!data) return data;
  
  const anonymized = { ...data };
  
  if (anonymized.donor_email) {
    const [, domain] = anonymized.donor_email.split('@');
    anonymized.donor_email = `***@${domain}`;
  }
  
  if (anonymized.donor_phone) {
    anonymized.donor_phone = anonymized.donor_phone.replace(/\d/g, '*');
  }
  
  if (anonymized.donor_name && anonymized.is_anonymous) {
    anonymized.donor_name = 'Donante Anónimo';
  }
  
  return anonymized;
};

export const validateDataRetention = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7); // 7 años de retención

    const result = await pool.query(`
      SELECT COUNT(*) as old_records 
      FROM donations 
      WHERE created_at < $1 AND status = 'rejected'
    `, [cutoffDate]);

    if (parseInt(result.rows[0].old_records) > 0) {
      console.warn(`GDPR Warning: ${result.rows[0].old_records} old records found that may need deletion`);
    }

    next();
  } catch (error) {
    console.error('Error checking data retention:', error);
    next();
  }
};

export const logDataAccess = (action: string, req: Request, dataType?: string, recordId?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    dataType,
    recordId,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    user: (req as any).user?.username || 'anonymous'
  };
  
  console.log('DATA_ACCESS_LOG:', JSON.stringify(logEntry));
};

export const consentMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.donorEmail || req.body.donorPhone) {
    req.body.gdprConsent = true;
    req.body.consentTimestamp = new Date().toISOString();
  }
  
  next();
};

export const dataMinimization = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.isAnonymous) {
    delete req.body.donorName;
    delete req.body.donorEmail;
    delete req.body.donorPhone;
  }
  
  next();
};

export const rightToBeForgettenHandler = async (email: string): Promise<boolean> => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      await client.query(`
        UPDATE donations 
        SET 
          donor_name = NULL,
          donor_email = NULL, 
          donor_phone = NULL,
          message = '[Datos eliminados por solicitud del usuario]'
        WHERE donor_email = $1
      `, [email]);
      
      await client.query(`
        UPDATE referrals 
        SET 
          email = NULL,
          phone = NULL
        WHERE email = $1
      `, [email]);
      
      await client.query('COMMIT');
      
      console.log(`GDPR: Data erasure completed for ${email}`);
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error in data erasure:', error);
    return false;
  }
};

export const dataPortabilityHandler = async (email: string): Promise<any> => {
  try {
    const donationsResult = await pool.query(`
      SELECT 
        reference_number, donor_name, amount, currency, 
        created_at, message, is_anonymous
      FROM donations 
      WHERE donor_email = $1
    `, [email]);

    const referralsResult = await pool.query(`
      SELECT 
        code, name, total_donations, total_amount, created_at
      FROM referrals 
      WHERE email = $1
    `, [email]);

    const userData = {
      exportDate: new Date().toISOString(),
      email: email,
      donations: donationsResult.rows,
      referrals: referralsResult.rows,
      gdprNote: 'Este es un extracto completo de todos los datos personales almacenados en nuestro sistema.'
    };

    console.log(`GDPR: Data export generated for ${email}`);
    return userData;

  } catch (error) {
    console.error('Error in data portability:', error);
    throw error;
  }
};