import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const cleanupStore = () => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
};

setInterval(cleanupStore, 60000);

export const createRateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator ? options.keyGenerator(req) : (req.ip || 'unknown');
    const now = Date.now();
    
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
      return next();
    }

    if (store[key].count >= options.maxRequests) {
      const timeUntilReset = Math.ceil((store[key].resetTime - now) / 1000);
      
      return res.status(429).json({
        error: options.message || 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.',
        retryAfter: timeUntilReset
      });
    }

    store[key].count++;
    next();
  };
};

export const donationRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Demasiados intentos de donación. Inténtalo de nuevo en 15 minutos.'
});

export const loginRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Demasiados intentos de inicio de sesión. Inténtalo de nuevo en 15 minutos.'
});

export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Demasiadas solicitudes. Inténtalo de nuevo más tarde.'
});