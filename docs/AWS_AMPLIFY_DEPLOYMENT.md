# AWS Amplify + RDS Deployment Guide
## Donaciones Pola de Allande

This guide will deploy the donation website using AWS Amplify (frontend + backend) and RDS PostgreSQL (database).

**Estimated Time:** 25-30 minutes  
**Estimated Cost:** $10-25/month

## 🎯 **Pre-Deployment Checklist**

- [x] ✅ Local environment working
- [x] ✅ Code builds successfully  
- [x] ✅ Database schema ready
- [ ] AWS Account with billing set up
- [ ] GitHub repository (public or connected to AWS)
- [ ] Domain name (optional, can use Amplify subdomain)

## 📋 **Step-by-Step Deployment**

### **Step 1: Create RDS PostgreSQL Database (10 minutes)**

1. **Open AWS RDS Console:**
   - Go to [AWS RDS Console](https://console.aws.amazon.com/rds/)
   - Click "Create database"

2. **Database Configuration:**
   ```
   Engine: PostgreSQL
   Template: Free tier (or Production for real use)
   DB Instance Identifier: donaciones-pola-db
   Master Username: donaciones_admin
   Master Password: [Generate secure password - save it!]
   
   DB Instance Class: db.t3.micro (Free tier)
   Storage: 20 GB General Purpose SSD
   
   VPC: Default VPC
   Public Access: Yes (for initial setup)
   Security Group: Create new (donaciones-pola-sg)
   ```

3. **Security Group Configuration:**
   - After creation, edit security group
   - Add inbound rule: PostgreSQL (5432) from Anywhere (0.0.0.0/0)
   - **Note:** We'll restrict this later for security

4. **Save Database Connection Details:**
   ```
   Endpoint: donaciones-pola-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
   Port: 5432
   Database: postgres
   Username: donaciones_admin
   Password: [your-generated-password]
   ```

### **Step 2: Prepare Database Schema (5 minutes)**

1. **Connect to RDS from local:**
   ```bash
   # Install PostgreSQL client if not installed
   brew install postgresql  # macOS
   
   # Connect to RDS
   psql -h donaciones-pola-db.xxxxxxxxx.us-east-1.rds.amazonaws.com -U donaciones_admin -d postgres
   ```

2. **Create Application Database:**
   ```sql
   CREATE DATABASE donaciones_pola_allande;
   \c donaciones_pola_allande;
   ```

3. **Run Schema and Seed Data:**
   ```bash
   # Upload schema
   psql -h [RDS-ENDPOINT] -U donaciones_admin -d donaciones_pola_allande -f database/schema.sql
   
   # Upload seed data
   psql -h [RDS-ENDPOINT] -U donaciones_admin -d donaciones_pola_allande -f database/seed.sql
   ```

### **Step 3: Prepare Code for Amplify (5 minutes)**

1. **Create Amplify Build Configuration:**
   ```yaml
   # amplify.yml
   version: 1
   applications:
     - appRoot: frontend
       frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
     - appRoot: backend
       backend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist
           files:
             - '**/*'
         cache:
           paths:
             - node_modules/**/*
   ```

2. **Update Package.json Scripts (if needed):**
   ```json
   // backend/package.json
   {
     "scripts": {
       "start": "node dist/index.js",
       "build": "tsc",
       "dev": "ts-node src/index.ts"
     }
   }
   ```

3. **Create Production Environment File:**
   ```bash
   # backend/.env.production
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://donaciones_admin:[PASSWORD]@[RDS-ENDPOINT]:5432/donaciones_pola_allande
   JWT_SECRET=[generate-32-char-secret]
   ENCRYPTION_KEY=[generate-32-char-key]
   FRONTEND_URL=https://[your-amplify-domain].amplifyapp.com
   ```

### **Step 4: Deploy to AWS Amplify (10 minutes)**

1. **Open AWS Amplify Console:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"

2. **Connect Repository:**
   - Select "GitHub" (or your git provider)
   - Authorize AWS Amplify access
   - Select your repository: `donaciones-pola-allande`
   - Branch: `main` or `master`

3. **App Settings:**
   ```
   App name: donaciones-pola-allande
   Environment name: production
   ```

4. **Build Settings:**
   - Amplify should auto-detect the build settings
   - If not, upload the `amplify.yml` file created above

5. **Environment Variables:**
   Add these in Amplify Console → App Settings → Environment variables:
   
   **Backend Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://donaciones_admin:[PASSWORD]@[RDS-ENDPOINT]:5432/donaciones_pola_allande
   JWT_SECRET=[your-32-char-secret]
   ENCRYPTION_KEY=[your-32-char-key]
   FRONTEND_URL=https://[amplify-domain].amplifyapp.com
   BANK_NAME=Banco Santander
   BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890
   BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande
   ADMIN_EMAIL=admin@polaallande.org
   ADMIN_PASSWORD=[secure-password]
   ```
   
   **Frontend Variables:**
   ```
   VITE_API_URL=https://[amplify-domain].amplifyapp.com/api
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_NODE_ENV=production
   ```

6. **Deploy:**
   - Review settings and click "Save and deploy"
   - Wait for deployment (5-10 minutes)

### **Step 5: Configure Custom Domain (Optional - 5 minutes)**

1. **Add Custom Domain:**
   - In Amplify Console → Domain management
   - Click "Add domain"
   - Enter your domain: `donacionespolaallande.org`

2. **DNS Configuration:**
   - Add CNAME records provided by Amplify to your DNS provider
   - Wait for SSL certificate validation (10-15 minutes)

### **Step 6: Test and Verify (5 minutes)**

1. **Test Application:**
   ```bash
   # Test endpoints
   curl https://[your-domain].amplifyapp.com/api/health
   curl https://[your-domain].amplifyapp.com/api/content
   ```

2. **Database Connection Test:**
   - Visit admin page: `https://[your-domain].amplifyapp.com/admin`
   - Login with: `admin@polaallande.org` / `admin123dev`
   - Verify dashboard loads with data

3. **Donation Flow Test:**
   - Create a test donation
   - Verify bank transfer instructions appear
   - Check database for new donation record

## 🔐 **Security Hardening (Post-Deployment)**

### **1. Restrict RDS Access:**
```bash
# Get Amplify IP ranges and update security group
# Remove 0.0.0.0/0 rule and add specific IPs
```

### **2. Update Admin Password:**
```sql
-- Connect to production database
UPDATE admin_users 
SET password_hash = '$2b$12$[new-bcrypt-hash]' 
WHERE email = 'admin@polaallande.org';
```

### **3. Enable Monitoring:**
- CloudWatch logs for Amplify
- RDS monitoring and backups
- Set up billing alerts

## 📊 **Cost Breakdown**

**Monthly AWS Costs:**
```
AWS Amplify:
- Build minutes: ~$0.01/minute (usually <$1/month)
- Hosting: ~$1-5/month for small traffic

RDS PostgreSQL (t3.micro):
- Instance: ~$12-15/month
- Storage (20GB): ~$2-3/month
- Backups: ~$1-2/month

Data Transfer:
- Usually <$1/month for small sites

Total: ~$15-25/month
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   - Check Amplify build logs
   - Verify environment variables
   - Test build locally first

2. **Database Connection Issues:**
   - Verify RDS endpoint and credentials
   - Check security group rules
   - Test connection from local machine

3. **404 Errors:**
   - Check routing configuration
   - Verify build artifacts
   - Check Amplify app settings

### **Useful Commands:**

```bash
# Check local build
npm run build

# Test database connection
psql -h [RDS-ENDPOINT] -U donaciones_admin -d donaciones_pola_allande -c "SELECT COUNT(*) FROM admin_users;"

# View Amplify logs
# (Available in Amplify Console)
```

## 📱 **Post-Deployment Steps**

1. **Update DNS** (if using custom domain)
2. **Set up Google Analytics** with real measurement ID
3. **Configure real bank details**
4. **Test all user flows**
5. **Set up monitoring alerts**
6. **Create backup strategy**

## 🎉 **You're Live!**

Your donation website is now live on AWS with:
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Managed database
- ✅ Continuous deployment

**Next:** Set up domain and SSL (if using custom domain)

---

**Support:** If you encounter issues, check AWS documentation or contact AWS support.
**Last Updated:** August 2025