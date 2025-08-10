import { Request, Response, NextFunction } from 'express';

// Serverless-compatible logging (console only)
const logToConsole = (type: string, data: any) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, just log minimal info
    console.log(`[${type}]`, JSON.stringify(data));
  } else {
    // In development, log more details
    console.log(`[${type}]`, data);
  }
};

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
    
    logToConsole('ACCESS', logEntry);
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
  
  logToConsole('ERROR', logEntry);
  
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
  
  logToConsole('SECURITY', logEntry);
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
  
  logToConsole('DONATION', logEntry);
};

export const auditLogger = (action: string, userId: string, resourceId?: string, changes?: any) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    userId,
    resourceId,
    changes
  };
  
  logToConsole('AUDIT', logEntry);
};