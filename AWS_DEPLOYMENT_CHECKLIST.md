# 🚀 AWS Amplify Deployment Checklist
## Donaciones Pola de Allande - Ready to Deploy!

**Status: ✅ ALL PREPARATION COMPLETE**
- ✅ Code builds successfully (backend & frontend)
- ✅ Environment variables generated
- ✅ Deployment configuration ready
- ✅ Database schema prepared

**Estimated Deployment Time: 25-30 minutes**

---

## 📋 **Step-by-Step Deployment Process**

### **Step 1: Create RDS Database (10 minutes)**

1. **Go to AWS RDS Console:** https://console.aws.amazon.com/rds/
2. **Click "Create database"**
3. **Use these settings:**
   ```
   ✅ Engine: PostgreSQL
   ✅ Template: Free tier (for testing) or Production
   ✅ DB Instance Identifier: donaciones-pola-db
   ✅ Master Username: donaciones_admin
   ✅ Master Password: [Generate and SAVE securely!]
   ✅ Instance Class: db.t3.micro (free tier)
   ✅ Storage: 20 GB
   ✅ Public Access: Yes (temporarily for setup)
   ```
4. **Click "Create database" and wait 5-8 minutes**
5. **Copy the endpoint URL when ready**

### **Step 2: Setup Database (5 minutes)**

1. **Connect to your new RDS database:**
   ```bash
   psql -h [YOUR-RDS-ENDPOINT] -U donaciones_admin -d postgres
   ```

2. **Create the application database:**
   ```sql
   CREATE DATABASE donaciones_pola_allande;
   \q
   ```

3. **Load schema and seed data:**
   ```bash
   # Run from your project directory
   psql -h [YOUR-RDS-ENDPOINT] -U donaciones_admin -d donaciones_pola_allande -f database/schema.sql
   psql -h [YOUR-RDS-ENDPOINT] -U donaciones_admin -d donaciones_pola_allande -f database/seed.sql
   ```

### **Step 3: Deploy to Amplify (10 minutes)**

1. **Go to AWS Amplify Console:** https://console.aws.amazon.com/amplify/
2. **Click "New app" → "Host web app"**
3. **Connect your GitHub repository**
4. **Configure app:**
   ```
   ✅ App name: donaciones-pola-allande
   ✅ Environment: production
   ✅ Branch: main/master
   ```

5. **Add Environment Variables** (App Settings → Environment variables):

   **COPY-PASTE THESE BACKEND VARIABLES:**
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://donaciones_admin:[YOUR_RDS_PASSWORD]@[YOUR_RDS_ENDPOINT]:5432/donaciones_pola_allande
   JWT_SECRET=N2QSbZ0ewpQ1k14Vsh6XiiE55NFnqtQIlyzqtfW55n0=
   ENCRYPTION_KEY=ezd/RrwApcN6cU4uhtAn1UG4tFOxO1fdAj6upI4nxxA=
   FRONTEND_URL=https://[YOUR_AMPLIFY_DOMAIN].amplifyapp.com
   BANK_NAME=Banco Santander
   BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890
   BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande
   BANK_SWIFT_CODE=BSCHESMM
   ADMIN_EMAIL=admin@polaallande.org
   ADMIN_PASSWORD=+KyhITAke7HEFUda1FTbWw==
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   DEBUG=false
   ```

   **COPY-PASTE THESE FRONTEND VARIABLES:**
   ```
   VITE_API_URL=https://[YOUR_AMPLIFY_DOMAIN].amplifyapp.com/api
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_NODE_ENV=production
   ```

6. **Click "Save and Deploy"**
7. **Wait for deployment (5-10 minutes)**

### **Step 4: Test Your Live Application (5 minutes)**

1. **Visit your live site:** `https://[amplify-domain].amplifyapp.com`
2. **Test these features:**
   - ✅ Homepage loads with event information
   - ✅ Donation form works
   - ✅ Admin login: `admin@polaallande.org` / `+KyhITAke7HEFUda1FTbWw==`
   - ✅ Referral system functions
   - ✅ Social sharing buttons work

---

## 🔐 **Your Secure Credentials**

**⚠️  SAVE THESE SECURELY - YOU'LL NEED THEM:**

```
🗄️  RDS Database:
   Username: donaciones_admin
   Password: [YOUR_GENERATED_PASSWORD]
   Endpoint: [YOUR_RDS_ENDPOINT]

🔑 Application Secrets:
   JWT_SECRET: N2QSbZ0ewpQ1k14Vsh6XiiE55NFnqtQIlyzqtfW55n0=
   ENCRYPTION_KEY: ezd/RrwApcN6cU4uhtAn1UG4tFOxO1fdAj6upI4nxxA=
   
👤 Admin Login:
   Email: admin@polaallande.org
   Password: +KyhITAke7HEFUda1FTbWw==
```

---

## 💰 **Expected Monthly Costs**

```
AWS Amplify Hosting: ~$1-5/month
RDS PostgreSQL (t3.micro): ~$15/month
Data Transfer: ~$1/month
Total: ~$17-21/month
```

---

## 🎉 **Post-Deployment Tasks**

**Immediately after going live:**

1. **Change admin password** (login and update in admin panel)
2. **Add real bank account details** (update environment variables)
3. **Set up Google Analytics** (replace G-XXXXXXXXXX)
4. **Test donation workflow** end-to-end
5. **Secure RDS** (restrict security group to Amplify IPs only)

**Optional - Custom Domain:**
1. Purchase domain name
2. Add to Amplify console (Domain management)
3. Update DNS records
4. Wait for SSL certificate (15 minutes)

---

## 🚨 **Troubleshooting**

**If deployment fails:**
1. Check build logs in Amplify console
2. Verify environment variables
3. Test local build: `npm run build`

**If database connection fails:**
1. Verify RDS endpoint and password
2. Check security group (port 5432 open)
3. Test connection: `psql -h [endpoint] -U donaciones_admin -d donaciones_pola_allande`

---

## 📞 **Support Resources**

- 📚 **Full Guide:** `docs/AWS_AMPLIFY_DEPLOYMENT.md`
- 🏗 **AWS Console Links:**
  - RDS: https://console.aws.amazon.com/rds/
  - Amplify: https://console.aws.amazon.com/amplify/
  - CloudWatch: https://console.aws.amazon.com/cloudwatch/
- 📧 **AWS Support:** Available in console
- 📖 **Amplify Docs:** https://docs.aws.amazon.com/amplify/

---

## ✅ **Ready to Launch!**

**Everything is prepared and ready to deploy. Your donation website will be:**
- ✅ **Secure** (HTTPS, encrypted data, GDPR compliant)
- ✅ **Scalable** (auto-scaling infrastructure)
- ✅ **Fast** (global CDN, optimized builds)
- ✅ **Professional** (AWS enterprise infrastructure)

**🚀 Start with Step 1: Create RDS Database**

**Time to launch: ~25 minutes to live website!**