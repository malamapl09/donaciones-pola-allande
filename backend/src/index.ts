import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import donationsRouter from './routes/donations';
import referralsRouter from './routes/referrals';
import contentRouter from './routes/content';
import adminRouter from './routes/admin';
import privacyRouter from './routes/privacy';

import { generalRateLimit } from './middleware/rateLimit';
import { sanitizeInput, validateReferer, validateContentType, preventXSS, detectSuspiciousActivity } from './middleware/security';
import { gdprCompliance, dataMinimization, consentMiddleware } from './middleware/gdpr';
import { requestLogger, errorLogger } from './middleware/logging';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://yourdomain.com'
    : ['http://localhost:3000', 'http://localhost:5173', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(requestLogger);
app.use(morgan('combined'));
app.use(preventXSS);
app.use(detectSuspiciousActivity);
app.use(generalRateLimit);
app.use(validateReferer);
app.use(validateContentType);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use(sanitizeInput);
app.use(gdprCompliance);
app.use(dataMinimization);
app.use(consentMiddleware);

app.use('/api/donations', donationsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/content', contentRouter);
app.use('/api/admin', adminRouter);
app.use('/api/privacy', privacyRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Donaciones Pola de Allande API',
    version: '1.0.0',
    endpoints: [
      'GET /api/health',
      'POST /api/donations',
      'GET /api/donations/stats',
      'GET /api/donations/:referenceNumber',
      'POST /api/referrals',
      'GET /api/referrals/:code',
      'GET /api/referrals',
      'GET /api/content',
      'GET /api/content/section/:section',
      'GET /api/content/goals',
      'POST /api/admin/login',
      'GET /api/admin/donations',
      'PATCH /api/admin/donations/:id/status',
      'GET /api/admin/dashboard'
    ]
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use(errorLogger);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security: Enhanced middleware active`);
  console.log(`🛡️ GDPR: Compliance features enabled`);
  console.log(`📝 Logging: Request/Error logging active`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});