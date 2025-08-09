# 🚀 Amplify + Supabase Deployment Checklist
## Donaciones Pola de Allande - FREE/CHEAP DEPLOYMENT!

**💰 Monthly Cost: $0-5 (instead of $16-20!)**
**⏱ Time to Deploy: 20-25 minutes**
**✨ Quality: Professional AWS + Supabase**

---

## 🎯 **Step 1: Push to GitHub (5 minutes)**

### **Create GitHub Repository:**
1. **Go to:** https://github.com/new
2. **Settings:**
   - Name: `donaciones-pola-allande`
   - Description: `Donation website for El Día del Inmigrante 2026`
   - Public repository ✅ (required for free Amplify)
   - Don't initialize with README ✅

3. **Push our code:**
   ```bash
   cd /Users/mariolama/Projects/Donationes\ Pola\ de\ Allande
   git add .
   git commit -m "Initial commit: Donation website for El Día del Inmigrante 2026

   🎉 Generated with Claude Code (https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>"
   git branch -M main
   git remote add origin https://github.com/[YOUR-USERNAME]/donaciones-pola-allande.git
   git push -u origin main
   ```

---

## 🗄️ **Step 2: Create Supabase Database - FREE! (5 minutes)**

### **Sign up and create project:**
1. **Go to:** https://supabase.com
2. **Sign up with GitHub** (easiest option)
3. **Create new project:**
   - Name: `donaciones-pola-allande`
   - Database Password: **Generate strong password & SAVE IT!**
   - Region: `East US (N. Virginia)` (or closest to your users)
   - Pricing: **Free Plan** ✅

### **Set up database:**
4. **Wait 2-3 minutes** for project creation
5. **Go to SQL Editor** in your Supabase dashboard
6. **Run Schema:**
   - Copy entire content from `database/supabase-schema.sql`
   - Paste in SQL Editor and click "Run"
   - ✅ Should see "Success" message

7. **Run Seed Data:**
   - Copy entire content from `database/supabase-seed.sql` 
   - Paste in SQL Editor and click "Run"
   - ✅ Should see "Seed data inserted successfully!" notification

### **Get connection string:**
8. **Go to Settings → Database**
9. **Copy connection string** (URI format)
   - Looks like: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
   - **SAVE THIS!** You'll need it for Amplify

---

## 🚀 **Step 3: Deploy to AWS Amplify (10 minutes)**

### **Create Amplify app:**
1. **Go to:** https://console.aws.amazon.com/amplify/
2. **Click:** "New app" → "Host web app"
3. **Connect GitHub:**
   - Authorize AWS Amplify to access your GitHub
   - Select repository: `donaciones-pola-allande`
   - Branch: `main`

### **Configure build:**
4. **App settings:**
   - App name: `donaciones-pola-allande`
   - Environment name: `production`

5. **Build settings:** Should auto-detect from `amplify.yml` ✅

### **Add environment variables:**
6. **Go to:** App Settings → Environment variables
7. **Add these BACKEND variables:**

   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=[YOUR_SUPABASE_CONNECTION_STRING]
   JWT_SECRET=N2QSbZ0ewpQ1k14Vsh6XiiE55NFnqtQIlyzqtfW55n0=
   ENCRYPTION_KEY=ezd/RrwApcN6cU4uhtAn1UG4tFOxO1fdAj6upI4nxxA=
   FRONTEND_URL=https://[WILL_BE_PROVIDED_BY_AMPLIFY].amplifyapp.com
   BANK_NAME=Banco Santander
   BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890
   BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande
   BANK_SWIFT_CODE=BSCHESMM
   ADMIN_EMAIL=admin@polaallande.org
   ADMIN_PASSWORD=+KyhITAke7HEFUda1FTbWw==
   GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
   DEBUG=false
   ```

8. **Add these FRONTEND variables:**
   ```
   VITE_API_URL=https://[WILL_BE_PROVIDED_BY_AMPLIFY].amplifyapp.com/api
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   VITE_NODE_ENV=production
   ```

### **Deploy:**
9. **Click:** "Save and deploy"
10. **Wait:** 5-8 minutes for deployment
11. **Get your domain:** Amplify will provide a URL like `https://main.abc123.amplifyapp.com`
12. **Update FRONTEND_URL:** Edit the `FRONTEND_URL` environment variable with your actual Amplify domain

---

## ✅ **Step 4: Test Your Live Website! (5 minutes)**

### **Test these features:**
1. **Visit your live site:** `https://[your-amplify-domain].amplifyapp.com`
2. **Homepage:** Should load with event info and donation stats
3. **Donation form:** Try creating a test donation
4. **Admin panel:** `https://[your-domain]/admin`
   - Username: `admin@polaallande.org`
   - Password: `+KyhITAke7HEFUda1FTbWw==`
5. **Referral system:** Try accessing `https://[your-domain]?ref=EMBAJADOR2026`

---

## 🔐 **Your Secure Credentials - SAVE THESE!**

```
🗄️  Supabase Database:
   Project URL: https://app.supabase.com/project/[your-ref]
   Connection String: [YOUR_SUPABASE_CONNECTION_STRING]
   Dashboard Password: [YOUR_SUPABASE_PASSWORD]

🔑 Generated Secrets:
   JWT_SECRET: N2QSbZ0ewpQ1k14Vsh6XiiE55NFnqtQIlyzqtfW55n0=
   ENCRYPTION_KEY: ezd/RrwApcN6cU4uhtAn1UG4tFOxO1fdAj6upI4nxxA=

👤 Admin Login:
   Email: admin@polaallande.org
   Password: +KyhITAke7HEFUda1FTbWw==
```

---

## 💰 **What You're Getting for FREE/CHEAP:**

```
✅ Professional hosting (AWS Amplify)
✅ Global CDN for fast loading worldwide  
✅ Automatic HTTPS/SSL certificates
✅ PostgreSQL database (500MB - plenty!)
✅ Real-time database features
✅ Automatic deployments from GitHub
✅ Database backups and monitoring
✅ Admin dashboard for data management

Monthly Cost: $0-5 vs $16-20 with RDS! 💰
```

---

## 🎉 **Post-Deployment Tasks**

**Immediate (required):**
1. **Change admin password** (login and update)
2. **Test full donation workflow** 
3. **Add real Google Analytics ID**
4. **Update bank account details** (if different)

**Optional (recommended):**
1. **Set up custom domain** (purchase domain, add to Amplify)
2. **Configure email notifications**
3. **Set up monitoring alerts**

---

## 🚨 **Troubleshooting**

**Build fails:**
- Check Amplify build logs
- Verify all environment variables are set
- Test local build: `npm run build`

**Database connection fails:**
- Verify Supabase connection string is correct
- Check if database is running in Supabase dashboard
- Test connection in Supabase SQL Editor

**Admin login fails:**
- Verify seed data was inserted
- Check admin_users table in Supabase dashboard
- Password is: `+KyhITAke7HEFUda1FTbWw==`

---

## 📊 **Supabase Dashboard Features**

**You get a beautiful dashboard at:** `https://app.supabase.com/project/[your-ref]`

- 📊 **Table Editor:** View and edit donations, referrals
- 📈 **API Logs:** Monitor all database requests  
- 🔍 **SQL Editor:** Run custom queries
- 📊 **Database Stats:** Usage and performance metrics
- 🔐 **Auth Management:** If you want to add user accounts later

---

## ✅ **SUCCESS!**

**🎉 Your donation website is now LIVE with:**
- Professional AWS hosting
- Reliable Supabase database  
- 90% cost savings vs RDS
- Same quality and performance
- Easy management dashboards

**Total deployment time: ~20-25 minutes**  
**Monthly cost: $0-5 instead of $16-20!**

**Ready to help Pola de Allende raise funds for El Día del Inmigrante 2026! 🇩🇴💰**