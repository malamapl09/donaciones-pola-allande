# 🚀 Vercel Deployment Guide
## Donaciones Pola de Allande - FREE & FAST!

**💰 Cost: $0/month (FREE)**  
**⏱ Time: 5-10 minutes**  
**✨ Quality: Professional with Global CDN**

---

## 🎯 **Step 1: Deploy to Vercel (5 minutes)**

### **1. Sign up to Vercel:**
1. Go to: https://vercel.com
2. Click "Sign up with GitHub" (easiest option)
3. Authorize Vercel to access your GitHub

### **2. Import your repository:**
1. Click "New Project" 
2. Select your `donaciones-pola-allande` repository
3. Vercel will auto-detect it's a full-stack app
4. Click "Deploy" (it will fail first - that's expected)

### **3. Add Environment Variables:**
After the first deploy fails, go to:
- **Project Settings → Environment Variables**
- **Add these variables:**

```bash
# Database
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Security Keys
JWT_SECRET=N2QSbZ0ewpQ1k14Vsh6XiiE55NFnqtQIlyzqtfW55n0=
ENCRYPTION_KEY=ezd/RrwApcN6cU4uhtAn1UG4tFOxO1fdAj6upI4nxxA=

# App Configuration
NODE_ENV=production
FRONTEND_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app

# Frontend Variables
VITE_API_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app/api
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_NODE_ENV=production

# Optional - Bank Details
BANK_NAME=Banco Santander
BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890
BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande
```

### **4. Redeploy:**
1. Go to **Deployments** tab
2. Click "Redeploy" on the latest deployment
3. Wait 2-3 minutes for build to complete

---

## 🗄️ **Step 2: Set up Supabase Database (if not done)**

If you haven't set up Supabase yet:

1. **Go to:** https://supabase.com and create account
2. **Create project:** `donaciones-pola-allande` 
3. **Run schema:** Copy content from `database/supabase-schema.sql` → SQL Editor → Run
4. **Run seed data:** Copy content from `database/supabase-seed.sql` → SQL Editor → Run
5. **Get connection string:** Settings → Database → Connection String (URI)

---

## ✅ **Step 3: Test Your Website**

Your site will be available at: `https://[your-project].vercel.app`

### **Test these features:**
1. **Homepage:** Should load with donation form
2. **Donation:** Create a test donation 
3. **Admin login:** `https://[your-domain]/admin`
   - Email: `admin@polaallande.org`
   - Password: `+KyhITAke7HEFUda1FTbWw==`
4. **Debug tool:** `https://[your-domain]/debug-login.html`

---

## 🔧 **If Something Goes Wrong**

### **Build fails:**
- Check **Functions** tab in Vercel for error details
- Verify all environment variables are set
- Check build logs for specific errors

### **Database connection fails:**
- Verify `DATABASE_URL` is correct in environment variables
- Test connection in Supabase SQL Editor
- Check if Supabase project is running

### **Admin login fails:**
- Use debug tool: `https://[your-domain]/debug-login.html`
- Check Supabase `admin_users` table has data
- Try creating new admin user with SQL from `add-new-admin.sql`

---

## 🎉 **Success!**

**Your donation website is now LIVE with:**
- ✅ **FREE hosting** on Vercel's global CDN
- ✅ **Automatic HTTPS** and SSL certificates  
- ✅ **Serverless functions** for the backend API
- ✅ **PostgreSQL database** with Supabase (FREE)
- ✅ **Auto-deployments** from GitHub
- ✅ **Professional performance** and reliability

**Total cost: $0/month**  
**Perfect for El Día del Inmigrante 2026! 🇩🇴💰**

---

## 📋 **Post-Deployment Checklist**

**Required:**
- [ ] Test admin login and change password
- [ ] Test donation flow end-to-end  
- [ ] Add real Google Analytics ID
- [ ] Update bank account details (if needed)

**Optional:**
- [ ] Set up custom domain
- [ ] Configure email notifications
- [ ] Set up monitoring

**Ready to help Pola de Allande raise funds! 🚀**