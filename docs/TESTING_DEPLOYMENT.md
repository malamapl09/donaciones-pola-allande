# Testing, Deployment, and Hosting Guide
## Donaciones Pola de Allande

This guide covers how to test, deploy, and host the donation website for "El Día del Inmigrante 2026" event.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git
- A web server (nginx recommended)

### 1. Environment Setup

#### Fix npm cache issues (if needed):
```bash
sudo chown -R $(whoami) ~/.npm
npm cache clean --force
```

#### Clone and Setup:
```bash
git clone <your-repository-url>
cd donaciones-pola-allande
```

#### Database Setup:
```bash
# Start PostgreSQL
brew services start postgresql@17  # macOS
sudo systemctl start postgresql     # Linux

# Create database
createdb donaciones_pola_allande

# Run schema
psql -d donaciones_pola_allande -f database/schema.sql

# Seed test data
psql -d donaciones_pola_allande -f database/seed.sql
```

### 2. Backend Configuration

#### Install dependencies:
```bash
cd backend
npm install
```

#### Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings:
```

**Key environment variables:**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/donaciones_pola_allande

# Security
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
ENCRYPTION_KEY=your-super-secret-encryption-key-32-chars

# CORS
FRONTEND_URL=http://localhost:5173  # Development
FRONTEND_URL=https://yourdomain.com # Production

# Bank Details
BANK_NAME=Banco Santander
BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890
BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande
BANK_SWIFT_CODE=BSCHESMM

# Admin
ADMIN_EMAIL=admin@polaallande.org
ADMIN_PASSWORD=secure-admin-password

# Google Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

#### Start backend:
```bash
npm run dev  # Development
npm run build && npm start  # Production
```

### 3. Frontend Configuration

#### Install dependencies:
```bash
cd frontend
npm install
```

#### Configure environment variables:
```bash
cp .env.example .env
# Edit .env:
```

```env
VITE_API_URL=http://localhost:3001  # Development
VITE_API_URL=https://api.yourdomain.com  # Production
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Start frontend:
```bash
npm run dev  # Development server
npm run build  # Production build
npm run preview  # Preview production build
```

## 🧪 Testing

### Manual Testing Checklist

#### Database Tests:
- [x] ✅ Database connection successful
- [x] ✅ Schema created successfully (6 tables)
- [x] ✅ Seed data loaded (1 admin user, 3 referrals, 1 goal)
- [x] ✅ Triggers working (referral totals update)

#### Backend API Tests:
```bash
# Test server health
curl http://localhost:3001/health

# Test donations endpoint
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Test User",
    "donorEmail": "test@example.com", 
    "amount": 25.00,
    "donorCountry": "España"
  }'

# Test referrals endpoint
curl http://localhost:3001/api/referrals/TEST2024

# Test content endpoint
curl http://localhost:3001/api/content

# Test admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@polaallande.org",
    "password": "admin123dev"
  }'
```

#### Frontend Tests:
- [ ] Home page loads correctly with stats
- [ ] Donation form submits successfully
- [ ] Bank transfer instructions display
- [ ] Referral tracking works
- [ ] Admin dashboard accessible
- [ ] Social sharing buttons function
- [ ] Responsive design works
- [ ] Google Analytics tracking

#### Integration Tests:
- [ ] Frontend-backend API communication
- [ ] Database persistence
- [ ] Email notifications (if configured)
- [ ] Analytics events firing
- [ ] GDPR compliance features

## 🌐 Deployment Options

### Option 1: Traditional VPS/Server

#### Server Requirements:
- Ubuntu 20.04+ or similar
- 2GB RAM minimum
- 10GB storage
- Node.js 18+
- PostgreSQL 14+
- Nginx
- SSL certificate (Let's Encrypt recommended)

#### Deployment Steps:

1. **Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Nginx
sudo apt install nginx

# Install PM2 for process management
sudo npm install -g pm2
```

2. **Database Setup:**
```bash
sudo -u postgres createuser --interactive donaciones
sudo -u postgres createdb donaciones_pola_allande -O donaciones
```

3. **Application Deployment:**
```bash
# Clone repository
git clone <your-repo> /var/www/donaciones
cd /var/www/donaciones

# Backend setup
cd backend
cp .env.example .env
# Edit .env with production settings
npm install --production
npm run build

# Frontend setup  
cd ../frontend
cp .env.example .env
# Edit .env with production settings
npm install
npm run build

# Start backend with PM2
cd ../backend
pm2 start dist/index.js --name donaciones-backend
pm2 save
pm2 startup
```

4. **Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/donaciones
server {
    listen 80;
    server_name yourdomain.com;
    
    # Frontend
    location / {
        root /var/www/donaciones/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. **SSL Setup:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile for Backend:**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

2. **Create Dockerfile for Frontend:**
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

3. **Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: donaciones_pola_allande
      POSTGRES_USER: donaciones
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/1-schema.sql
      - ./database/seed.sql:/docker-entrypoint-initdb.d/2-seed.sql

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://donaciones:your_password@postgres:5432/donaciones_pola_allande
      NODE_ENV: production
    depends_on:
      - postgres
    ports:
      - "3001:3001"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Option 3: Cloud Deployment (Vercel + Heroku/Railway)

#### Frontend (Vercel):
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variables: `VITE_API_URL`, `VITE_GA_MEASUREMENT_ID`

#### Backend (Railway/Heroku):
1. Connect GitHub repository
2. Configure environment variables
3. Add PostgreSQL addon
4. Deploy

## 📊 Monitoring and Maintenance

### Monitoring Checklist:
- [ ] Server resource usage (CPU, RAM, Disk)
- [ ] Database performance and backups
- [ ] Application logs and error tracking
- [ ] SSL certificate expiration
- [ ] Google Analytics metrics
- [ ] Payment processing status

### Regular Maintenance:
- Weekly database backups
- Monthly security updates
- Quarterly dependency updates
- Annual SSL certificate renewal (if manual)

### Backup Strategy:
```bash
# Database backup
pg_dump donaciones_pola_allande > backup_$(date +%Y%m%d).sql

# Automated daily backups
echo "0 2 * * * pg_dump donaciones_pola_allande > /backups/backup_\$(date +\%Y\%m\%d).sql" | crontab -
```

## 🚨 Production Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets and encryption keys
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall (only ports 80, 443, 22)
- [ ] Regular security updates
- [ ] Database access restrictions
- [ ] Rate limiting configured
- [ ] Input validation and sanitization
- [ ] GDPR compliance measures
- [ ] Secure headers (CSP, HSTS, etc.)

## 📞 Support and Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure user permissions

2. **CORS Errors:**
   - Verify FRONTEND_URL matches exactly
   - Check protocol (http vs https)

3. **Build Errors:**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version compatibility

4. **Performance Issues:**
   - Monitor database query performance
   - Check server resources
   - Enable compression and caching

### Logs Locations:
- Backend logs: `backend/logs/`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `pm2 logs`

---

**Last Updated:** August 2025  
**Version:** 1.0  
**Contact:** admin@polaallande.org