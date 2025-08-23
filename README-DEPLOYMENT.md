# Railway Deployment Guide

This guide will help you deploy the Computer Science Department application to Railway.

## Prerequisites

1. GitHub account
2. Railway account (sign up at railway.app)
3. Push your code to a GitHub repository

## Deployment Steps

### Step 1: Deploy Backend (FastAPI)

1. Go to [Railway](https://railway.app) and login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will detect multiple services, choose to deploy the **backend** first
5. Set the following environment variables in Railway dashboard:
   - `FRONTEND_URL`: `https://your-frontend-domain.railway.app` (you'll get this from frontend deployment)
6. Railway will automatically build and deploy your FastAPI backend
7. Note down your backend URL: `https://your-backend-domain.railway.app`

### Step 2: Deploy Frontend (React)

1. In the same Railway project, add a new service
2. Connect it to the same GitHub repository
3. Set the root directory to `frontend`
4. Set the following environment variables:
   - `REACT_APP_API_URL`: `https://your-backend-domain.railway.app` (from Step 1)
5. Railway will build and deploy your React frontend

### Step 3: Update CORS Settings

1. Go back to your backend service in Railway
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. The backend will automatically restart and accept requests from your frontend

## Environment Variables Summary

### Backend Environment Variables:
```
FRONTEND_URL=https://your-frontend-domain.railway.app
```

### Frontend Environment Variables:
```
REACT_APP_API_URL=https://your-backend-domain.railway.app
```

## Important Notes

1. **Environment Variables**: Make sure to set the environment variables correctly in Railway's dashboard
2. **Build Process**: Railway will automatically detect and build your applications
3. **HTTPS**: Railway provides HTTPS by default
4. **Custom Domains**: You can add custom domains in Railway's dashboard
5. **Logs**: Check Railway's logs if deployment fails

## File Structure

The repository is structured for Railway deployment:

```
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── railway.json         # Railway config for backend
│   └── Procfile            # Process file for deployment
├── frontend/
│   ├── src/                # React source code
│   ├── package.json        # Node.js dependencies
│   ├── railway.json        # Railway config for frontend
│   ├── .env                # Local environment variables
│   ├── .env.production     # Production environment template
│   └── Procfile           # Process file for deployment
└── railway.toml           # Global Railway configuration
```

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure FRONTEND_URL is set correctly in backend
2. **API Connection Failed**: Verify REACT_APP_API_URL in frontend
3. **Build Failures**: Check logs in Railway dashboard
4. **404 Errors on Refresh**: Railway's serve command handles SPA routing

### Testing Deployment:

1. Visit your frontend URL
2. Test navigation between pages
3. Test the chatbot functionality
4. Check analytics dashboard
5. Verify course data loads correctly

## Local Development

To run locally after making these changes:

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (in new terminal)
cd frontend
npm install
npm start
```

The `.env` file ensures local development still works with localhost URLs.