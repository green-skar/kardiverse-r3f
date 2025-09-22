# 🚀 Kardiverse Deployment Guide for Render

This guide will help you deploy your Kardiverse holographic display application to Render with both the React frontend and Django backend.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **API Keys**: Get your Mux API keys from [mux.com](https://mux.com)

## 🏗️ Project Structure

```
kardivers-r3f_final/
├── django_backend/          # Django REST API backend
│   ├── api/                 # API app
│   ├── kardiverse_backend/  # Django project settings
│   ├── requirements.txt     # Python dependencies
│   └── manage.py           # Django management
├── src/                     # React frontend source
├── public/                  # Static assets
├── render.yaml             # Render deployment config
└── package.json            # Node.js dependencies
```

## 🔧 Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all changes** to your GitHub repository
2. **Ensure render.yaml** is in the root directory
3. **Verify all files** are committed and pushed

### Step 2: Create Render Services

#### Option A: Using render.yaml (Recommended)

1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Click "New +"** → **"Blueprint"**
3. **Connect your GitHub repository**
4. **Select your repository** and branch
5. **Render will automatically detect** the render.yaml file
6. **Click "Apply"** to create both services

#### Option B: Manual Setup

If you prefer to set up services manually:

**Backend Service:**
1. **New +** → **Web Service**
2. **Connect GitHub** and select your repository
3. **Configure:**
   - **Name**: `kardiverse-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd django_backend && pip install -r requirements.txt && python manage.py migrate`
   - **Start Command**: `cd django_backend && gunicorn kardiverse_backend.wsgi:application`

**Frontend Service:**
1. **New +** → **Static Site**
2. **Connect GitHub** and select your repository
3. **Configure:**
   - **Name**: `kardiverse-frontend`
   - **Build Command**: `npm ci --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`

### Step 3: Configure Environment Variables

#### Backend Environment Variables

In your Render dashboard, go to your backend service → **Environment**:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=kardiverse-backend.onrender.com,localhost
CORS_ALLOWED_ORIGINS=https://kardiverse-frontend.onrender.com,http://localhost:5173
AI_TTS_API_KEY=your-ai-tts-api-key
MUX_TOKEN_ID=your-mux-token-id
MUX_TOKEN_SECRET=your-mux-token-secret
```

#### Frontend Environment Variables

In your Render dashboard, go to your frontend service → **Environment**:

```env
VITE_API_URL=https://kardiverse-backend.onrender.com
VITE_MUX_TOKEN_ID=your-mux-token-id
VITE_MUX_TOKEN_SECRET=your-mux-token-secret
```

### Step 4: Deploy

1. **Click "Deploy"** on both services
2. **Wait for deployment** to complete (5-10 minutes)
3. **Check the logs** for any errors

## 🔗 Service URLs

After deployment, you'll get URLs like:
- **Backend**: `https://kardiverse-backend.onrender.com`
- **Frontend**: `https://kardiverse-frontend.onrender.com`

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures

**Frontend Build Issues:**
```bash
# Check if all dependencies are in package.json
npm install --legacy-peer-deps
npm run build
```

**Backend Build Issues:**
```bash
# Check Python version and dependencies
cd django_backend
pip install -r requirements.txt
python manage.py migrate
```

#### 2. CORS Errors

If you see CORS errors:
1. **Check CORS_ALLOWED_ORIGINS** in backend environment variables
2. **Ensure frontend URL** is included in the CORS settings
3. **Verify VITE_API_URL** points to your backend URL

#### 3. API Connection Issues

1. **Check VITE_API_URL** environment variable
2. **Verify backend is running** and accessible
3. **Check backend logs** for errors

#### 4. Mux API Issues

1. **Verify MUX_TOKEN_ID** and **MUX_TOKEN_SECRET** are set
2. **Check Mux dashboard** for API usage
3. **Ensure videos are publicly accessible** (not localhost)

### Debugging Commands

**Check Backend Health:**
```bash
curl https://kardiverse-backend.onrender.com/api/scan-count/
```

**Check Frontend Build:**
```bash
npm run build
ls -la dist/
```

## 📊 Monitoring

### Render Dashboard

1. **Service Health**: Check service status in dashboard
2. **Logs**: View real-time logs for debugging
3. **Metrics**: Monitor CPU, memory, and response times

### Application Monitoring

1. **Backend Logs**: Check Django logs for API errors
2. **Frontend Console**: Check browser console for client-side errors
3. **Network Tab**: Verify API calls are working

## 🔄 Updates and Maintenance

### Deploying Updates

1. **Push changes** to your GitHub repository
2. **Render automatically deploys** from your main branch
3. **Monitor deployment** in the dashboard

### Database Migrations

If you add new Django models:
1. **Create migration**: `python manage.py makemigrations`
2. **Commit migration files** to repository
3. **Render will run migrations** automatically during deployment

### Environment Variable Updates

1. **Update variables** in Render dashboard
2. **Redeploy service** to apply changes
3. **Test functionality** after deployment

## 💰 Cost Considerations

### Render Free Tier Limits

- **750 hours/month** per service
- **Services sleep** after 15 minutes of inactivity
- **Cold start time** of ~30 seconds when waking up

### Upgrading Plans

- **Starter Plan**: $7/month per service (always-on)
- **Standard Plan**: $25/month per service (better performance)

## 🎯 Production Optimizations

### Performance

1. **Enable gzip compression** in Django
2. **Use CDN** for static assets
3. **Optimize images** and videos
4. **Enable caching** where appropriate

### Security

1. **Set strong SECRET_KEY**
2. **Use HTTPS** (automatic on Render)
3. **Configure proper CORS** settings
4. **Regular security updates**

## 📞 Support

### Render Support
- **Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

### Project-Specific Issues
- **Check logs** in Render dashboard
- **Verify environment variables**
- **Test locally** before deploying

## ✅ Deployment Checklist

- [ ] Code committed to GitHub
- [ ] render.yaml configured
- [ ] Environment variables set
- [ ] Backend service deployed
- [ ] Frontend service deployed
- [ ] CORS configured correctly
- [ ] API endpoints working
- [ ] Mux API keys configured
- [ ] Video files accessible
- [ ] Application tested end-to-end

---

**🎉 Congratulations!** Your Kardiverse application should now be live on Render with both frontend and backend services running smoothly.
