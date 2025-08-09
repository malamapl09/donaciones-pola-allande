# AWS Amplify + Supabase Deployment Guide
## Donaciones Pola de Allande - FREE/CHEAP DEPLOYMENT! 💰

**Monthly Cost: $0-5 (vs $16-20 with RDS)**
**Estimated Time: 20-25 minutes**
**Quality: Professional AWS hosting + reliable Supabase database**

## 🎯 **Why This Combo is Perfect:**

- ✅ **AWS Amplify**: Professional hosting, CDN, SSL, auto-deployment
- ✅ **Supabase**: Free PostgreSQL database (500MB, plenty for donations)
- ✅ **Same code**: No changes needed (still PostgreSQL!)
- ✅ **Scalable**: Easy to upgrade if you grow
- ✅ **Reliable**: Both platforms are production-ready

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Create GitHub Repository (5 minutes)**

1. **Go to GitHub.com** and create new repository
2. **Repository settings:**
   ```
   ✅ Name: donaciones-pola-allande
   ✅ Description: Donation website for El Día del Inmigrante 2026
   ✅ Public (required for free Amplify)
   ✅ Initialize with README: No (we have one)
   ```

3. **Push our code** (I'll help with this)

### **Step 2: Create Supabase Database - FREE! (5 minutes)**

1. **Go to https://supabase.com**
2. **Sign up with GitHub** (easiest)
3. **Create new project:**
   ```
   ✅ Name: donaciones-pola-allande
   ✅ Database Password: [Generate strong password - SAVE IT!]
   ✅ Region: Choose closest to your users (e.g., East US)
   ✅ Pricing Plan: Free (500MB DB, 2GB bandwidth)
   ```

4. **Wait 2-3 minutes** for database creation

5. **Get connection details:**
   - Go to **Settings** → **Database**
   - Copy **Connection string** (looks like: `postgresql://postgres:[password]@[host]:5432/postgres`)

6. **Set up database schema:**
   - Go to **SQL Editor** in Supabase dashboard
   - Copy and run our schema (I'll provide this)

### **Step 3: Deploy to AWS Amplify (10 minutes)**

1. **Go to AWS Amplify Console:** https://console.aws.amazon.com/amplify/
2. **Create new app:** "Host web app"
3. **Connect GitHub repository**
4. **App configuration:**
   ```
   ✅ Repository: donaciones-pola-allande
   ✅ Branch: main
   ✅ App name: donaciones-pola-allande
   ✅ Environment: production
   ```

5. **Add environment variables** (I'll provide the exact list)
6. **Deploy and test!**

---

## 🔗 **Updated Environment Variables**

**BACKEND VARIABLES (for Amplify):**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:[SUPABASE_PASSWORD]@[SUPABASE_HOST]:5432/postgres
JWT_SECRET=N2QSbZ0ewpQ1k14Vsh6XiiE55NFnqtQIlyzqtfW55n0=
ENCRYPTION_KEY=ezd/RrwApcN6cU4uhtAn1UG4tFOxO1fdAj6upI4nxxA=
FRONTEND_URL=https://[AMPLIFY_DOMAIN].amplifyapp.com
BANK_NAME=Banco Santander
BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890
BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande
ADMIN_EMAIL=admin@polaallande.org
ADMIN_PASSWORD=+KyhITAke7HEFUda1FTbWw==
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
DEBUG=false
```

**FRONTEND VARIABLES (for Amplify):**
```
VITE_API_URL=https://[AMPLIFY_DOMAIN].amplifyapp.com/api
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_NODE_ENV=production
```

---

## 💰 **Cost Breakdown - MUCH CHEAPER!**

```
🆓 Supabase Free Tier:
   - 500MB Database (plenty for donations)
   - 2GB Bandwidth per month
   - Unlimited API requests
   - Real-time subscriptions
   - Row Level Security

💲 AWS Amplify:
   - Build minutes: ~$0-1/month
   - Hosting: ~$1-5/month
   - SSL & CDN: FREE

💰 Total: $0-5/month (vs $16-20 with RDS!)
```

---

## 🚀 **What You Get:**

### **Same Professional Features:**
- ✅ **HTTPS/SSL** automatic
- ✅ **Global CDN** for fast loading
- ✅ **Auto-deployments** from GitHub
- ✅ **Database backups** (Supabase handles this)
- ✅ **Monitoring** and logs
- ✅ **Scalability** when you need it

### **Bonus Features with Supabase:**
- ✅ **Database UI** (easy to view/edit data)
- ✅ **Real-time** capabilities (if needed later)
- ✅ **Built-in auth** (could replace our JWT system)
- ✅ **API auto-generation**
- ✅ **Row-level security**

---

## 🔄 **Migration Benefits:**

**No Code Changes Needed!**
- ✅ Still PostgreSQL (same SQL, same schema)
- ✅ Same connection string format
- ✅ All our existing code works perfectly
- ✅ Just swap the database URL!

---

## 📈 **Scaling Path:**

**If you outgrow free tier:**
- Supabase Pro: $25/month (8GB database, more bandwidth)
- Still cheaper than RDS!
- Easy upgrade, no migration needed

---

## 🎯 **Ready to Deploy?**

**This setup gives you:**
- 💰 **90% cost savings** ($0-5 vs $16-20)
- 🚀 **Same performance** and reliability  
- 🔧 **Easier management** (better dashboards)
- 📊 **Better monitoring** (Supabase dashboard)

**Let's proceed with the deployment!** 

Would you like me to:
1. **Start with GitHub setup** (push our code)
2. **Create the Supabase database** (I'll guide you)
3. **Deploy to Amplify** (final step)

**Total time: ~20 minutes to live, professional website! 🎉**