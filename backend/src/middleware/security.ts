import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      return validator.escape(value.trim());
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};

export const validateReferer = (req: Request, res: Response, next: NextFunction) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://localhost:3000',
  ].filter(Boolean);

  const referer = req.get('Referer');
  const origin = req.get('Origin');

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    if (!origin && !referer) {
      return res.status(403).json({ error: 'Solicitud no válida' });
    }

    const requestOrigin = origin || (referer ? new URL(referer).origin : null);
    
    if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
      return res.status(403).json({ error: 'Origen no permitido' });
    }
  }

  next();
};

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type debe ser application/json' });
    }
  }

  next();
};

export const preventXSS = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
};

export const validateDonationAmount = (req: Request, res: Response, next: NextFunction) => {
  const { amount } = req.body;
  
  if (amount !== undefined) {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount < 0.01 || numAmount > 100000) {
      return res.status(400).json({ 
        error: 'Monto inválido. Debe estar entre €0.01 y €100,000' 
      });
    }
    
    if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
      return res.status(400).json({ 
        error: 'Monto inválido. Máximo 2 decimales permitidos' 
      });
    }

    req.body.amount = numAmount;
  }
  
  next();
};

export const logSecurityEvent = (eventType: string, req: Request, details?: any) => {
  const logData = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.url,
    method: req.method,
    details
  };
  
  console.warn('SECURITY_EVENT:', JSON.stringify(logData));
};

export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent');
  const suspiciousPatterns = [
    /curl/i,
    /wget/i,
    /bot/i,
    /crawler/i,
    /spider/i,
    /scanner/i
  ];

  if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent('SUSPICIOUS_USER_AGENT', req, { userAgent });
  }

  const suspiciousQueries = ['<script', 'javascript:', 'onload=', 'onerror='];
  const queryString = JSON.stringify(req.query).toLowerCase();
  
  if (suspiciousQueries.some(pattern => queryString.includes(pattern))) {
    logSecurityEvent('SUSPICIOUS_QUERY', req, { query: req.query });
    return res.status(400).json({ error: 'Solicitud inválida' });
  }

  next();
};