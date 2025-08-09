import { Request, Response, NextFunction } from 'express';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const logDir = process.env.LOG_DIR || 'logs';

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const createLogStream = (filename: string) => {
  return createWriteStream(join(logDir, filename), { flags: 'a' });
};

const accessLog = createLogStream('access.log');
const errorLog = createLogStream('error.log');
const securityLog = createLogStream('security.log');
const donationLog = createLogStream('donations.log');

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.get('Referer')
    };
    
    accessLog.write(JSON.stringify(logEntry) + '\n');
  });
  
  next();
};

export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  };
  
  errorLog.write(JSON.stringify(logEntry) + '\n');
  
  if (!res.headersSent) {
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Error interno del servidor' 
    });
  }
};

export const securityLogger = (event: string, req: Request, details?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    details
  };
  
  securityLog.write(JSON.stringify(logEntry) + '\n');
};

export const donationLogger = (action: string, req: Request, donationData?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    donation: donationData ? {
      referenceNumber: donationData.referenceNumber,
      amount: donationData.amount,
      isAnonymous: donationData.isAnonymous,
      referralCode: donationData.referralCode
    } : undefined
  };
  
  donationLog.write(JSON.stringify(logEntry) + '\n');
};

export const auditLogger = (action: string, userId: string, resourceId?: string, changes?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    resourceId,
    changes
  };
  
  const auditLog = createLogStream('audit.log');
  auditLog.write(JSON.stringify(logEntry) + '\n');
};