# 🚀 UNIEASE FULL DEPLOYMENT GUIDE - April 2026

## ✅ COMPLETED
- [x] Generated JWT secrets
- [x] Created `.env.production` files

---

## STEP-BY-STEP DEPLOYMENT

### 📦 STEP 1: SETUP MONGODB ATLAS (15-20 min)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

2. **Sign In / Create Account** (free tier available)

3. **Create a New Project**:
   - Project Name: "UniEase"
   - Click "Create Project"

4. **Create a Cluster**:
   - Choose "Free" tier (M0)
   - Cloud Provider: AWS
   - Region: Select closest to you (e.g., us-east-1)
   - Click "Create"
   - Wait 2-3 minutes for cluster to initialize

5. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Username: `uniease_mongodb`
   - Password: Generate strong password (save it!)
   - Permissions: "Atlas Admin"
   - Click "Add User"

6. **Setup Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

7. **Get Connection String**:
   - Go to "Databases" → Click "Connect" on your cluster
   - Choose "Drivers" → Node.js
   - Copy connection string (looks like):
     ```
     mongodb+srv://uniease_mongodb:PASSWORD@cluster0.xxxxx.mongodb.net/uniease?retryWrites=true&w=majority
     ```
   - Replace `PASSWORD` with your database user password
   - Replace `uniease` at end with `uniease` (database name)

**✅ SAVE CONNECTION STRING FOR LATER**

---

### 🐘 STEP 2: SETUP RENDER POSTGRESQL (10-15 min)

1. **Go to Render**: https://render.com

2. **Sign In with GitHub** (you already have account)

3. **Create New PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Database Name: `uniease`
   - Database User: `uniease_user`
   - Region: Select closest to you
   - PostgreSQL Version: 15 (or latest)
   - Pricing Plan: "Free" (1 GB disk, 90 days auto-delete if idle)
   - Click "Create Database"
   - Wait 2-3 minutes for setup

4. **Get Connection Details**:
   - Once created, go to your database page
   - Copy the "Internal Database URL" that starts with `postgres://...`
   - Format: `postgresql://uniease_user:PASSWORD@internal-ip:5432/uniease`

**✅ SAVE DATABASE URL FOR LATER**

5. **Initialize Database Schema** (we'll run SQL migrations):
   - Back in your project terminal:
   ```bash
   cd backend
   npm install pg
   ```
   - Create migrations to initialize tables (or use existing schema)

---

### 🌐 STEP 3: DEPLOY BACKEND TO RENDER (15-20 min)

1. **Go to Render Dashboard**: https://dashboard.render.com

2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your `uniease-project` repository
   - Build Command: `cd backend && npm install`
   - Start Command: `node backend/server.js`
   - Region: Same as your databases
   - Plan: "Free" tier
   - Click "Create Web Service"

3. **Set Environment Variables** (in Render dashboard):
   - Go to your service → "Environment Variables"
   - Add these variables:
   ```
   NODE_ENV=production
   PORT=3001

   JWT_SECRET=3ffea893d190aa0e421d551a06ecb0e631de1d99e885aa6ccb6d9f4b05cb25d2
   REFRESH_TOKEN_SECRET=04b20bea95a52a1efd224228272256e442cbee0fe12b0c63543ecd7100c49383
   JWT_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d

   DB_HOST=your_render_db_host
   DB_PORT=5432
   DB_NAME=uniease
   DB_USER=uniease_user
   DB_PASSWORD=your_render_db_password

   MONGODB_URI=mongodb+srv://uniease_mongodb:PASSWORD@cluster0.xxxxx.mongodb.net/uniease?retryWrites=true&w=majority

   CORS_ORIGIN=http://localhost:3000
   LOG_LEVEL=info
   ```

4. **Wait for Deployment**:
   - Render will build and deploy automatically
   - Check "Logs" tab to monitor
   - Once deployed, you'll get a URL like: `https://uniease-backend-xxxxx.onrender.com`
   - Test health endpoint: `https://uniease-backend-xxxxx.onrender.com/health`

**✅ SAVE BACKEND URL FOR LATER**

---

### ⚛️ STEP 4: DEPLOY FRONTEND TO VERCEL (10-15 min)

1. **Go to Vercel**: https://vercel.com

2. **Sign In with GitHub** (you already have account)

3. **Import Project**:
   - Click "New Project"
   - Find and select `uniease-project` repository
   - Framework Preset: "Create React App"
   - Root Directory: `frontend`
   - Click "Deploy"

4. **Set Environment Variables** (in Vercel):
   - Go to Project Settings → "Environment Variables"
   - Add:
   ```
   REACT_APP_API_URL=https://uniease-backend-xxxxx.onrender.com
   ```
   (Replace with YOUR actual Render backend URL)

5. **Redeploy**:
   - Go to "Deployments"
   - Click "Redeploy" to apply new environment variables

6. **Wait for Deployment**:
   - Vercel will build and deploy
   - Monitor in "Deployments" tab
   - Once done, you'll get URL like: `https://uniease-frontend-xxxxx.vercel.app`

**✅ FRONTEND NOW LIVE!**

---

### 🔄 STEP 5: UPDATE BACKEND CORS (2 min)

1. **Back to Render Backend Settings**:
   - Go to "Environment Variables"
   - Update `CORS_ORIGIN` from `http://localhost:3000` to:
   ```
   https://uniease-frontend-xxxxx.vercel.app
   ```

2. **Redeploy Backend**:
   - Go to "Deployments" → Click "Redeploy"

---

### ✅ STEP 6: TEST FULL APPLICATION (10 min)

Test in this order:

1. **Frontend loads**: Visit your Vercel URL
2. **Authentication**: Try login/signup
3. **Food Orders**: Create a new order
4. **Dashboard**: Check order status
5. **Real-time updates**: Check WebSocket connection in browser console

---

## 🆘 TROUBLESHOOTING

**Backend won't start?**
- Check Render logs: "Logs" tab in dashboard
- Verify all env vars are set
- Ensure PostgreSQL is accessible

**Frontend can't connect to backend?**
- Check `REACT_APP_API_URL` is correct
- Check CORS settings in backend
- Check browser console for CORS errors

**Database connection errors?**
- Verify connection strings are correct
- Check IP whitelisting on MongoDB Atlas
- Verify PostgreSQL credentials

---

## 📊 FINAL DEPLOYMENT CHECKLIST

- [ ] MongoDB Atlas cluster created & connection string saved
- [ ] Render PostgreSQL created & connection string saved
- [ ] Backend deployed to Render with all env vars
- [ ] Frontend deployed to Vercel with API URL
- [ ] Both services accessible from browser
- [ ] Auth works (signup/login/logout)
- [ ] Food ordering functional
- [ ] Real-time updates working

---

## 🎉 DEPLOYMENT COMPLETE!

Your UniEase application is now **LIVE** and running with:
- ✅ PostgreSQL database (Render managed)
- ✅ MongoDB database (MongoDB Atlas)
- ✅ Express backend (Render)
- ✅ React frontend (Vercel)
- ✅ Real-time Socket.io support
- ✅ Full authentication & RBAC
- ✅ Food ordering system
- ✅ Complaint management

**Radhe Radhe!** 🙏

---

## 📝 NOTES FOR FUTURE

- MongoDB Atlas free tier auto-deletes after 90 days of inactivity
- Render free PostgreSQL deletes after 90 days of web service inactivity
- Vercel deployments are automatic on GitHub push
- Consider upgrading to paid tiers for production use
