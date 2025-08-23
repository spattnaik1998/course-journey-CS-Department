# Docker Local Deployment Guide

This guide will help you run the Computer Science Department application using Docker containers locally.

## Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your operating system
2. Make sure Docker is running (you'll see the Docker icon in your system tray)

## Quick Start

### Option 1: One Command Deployment
```bash
docker-compose up --build
```

### Option 2: Step-by-Step Deployment

#### Step 1: Build the Containers
```bash
# Build both frontend and backend containers
docker-compose build
```

#### Step 2: Start the Services
```bash
# Start both services
docker-compose up
```

#### Step 3: Access the Application
- **Frontend (React App)**: http://localhost:3000
- **Backend (FastAPI)**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Docker Commands Reference

### Basic Operations
```bash
# Build and start services
docker-compose up --build

# Start services in background (detached mode)
docker-compose up -d

# Stop all services
docker-compose down

# View running containers
docker-compose ps

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs backend
docker-compose logs frontend
```

### Development Commands
```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Restart specific service
docker-compose restart backend
docker-compose restart frontend

# Stop specific service
docker-compose stop backend
docker-compose stop frontend
```

### Cleanup Commands
```bash
# Stop and remove containers, networks
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove containers, networks, volumes, and images
docker-compose down -v --rmi all

# Clean up unused Docker resources
docker system prune -a
```

## Application URLs

Once containers are running:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **API Alternative Docs**: http://localhost:8000/redoc

## Services Overview

### Backend Service
- **Container**: `cs-department-backend`
- **Port**: 8000
- **Technology**: FastAPI + Python
- **Auto-reload**: Enabled for development

### Frontend Service  
- **Container**: `cs-department-frontend`
- **Port**: 3000 (mapped to container port 80)
- **Technology**: React + Nginx
- **Production build**: Optimized build served by Nginx

## Environment Variables

The application uses these environment variables (set in docker-compose.yml):

### Backend
- `FRONTEND_URL=http://localhost:3000`

### Frontend
- `REACT_APP_API_URL=http://localhost:8000`

## Folder Structure

```
├── backend/
│   ├── Dockerfile          # Backend container configuration
│   ├── main.py            # FastAPI application
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── Dockerfile         # Frontend container configuration
│   ├── nginx.conf         # Nginx configuration
│   ├── package.json       # Node.js dependencies
│   └── src/              # React source code
├── docker-compose.yml     # Multi-container configuration
├── .env.docker           # Environment variables
└── .dockerignore         # Files to ignore in Docker build
```

## Testing the Application

1. **Start the containers**:
   ```bash
   docker-compose up --build
   ```

2. **Open your browser** and go to http://localhost:3000

3. **Test features**:
   - Browse different majors
   - View course details
   - Use the floating chatbot
   - Check the analytics dashboard
   - Download PDF plans

## Development Workflow

### Making Changes

#### Backend Changes
1. Edit files in the `backend/` directory
2. The backend container has hot-reload enabled
3. Changes will be reflected automatically

#### Frontend Changes
1. Edit files in the `frontend/src/` directory
2. Rebuild the frontend container:
   ```bash
   docker-compose build frontend
   docker-compose up -d frontend
   ```

### Viewing Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Check what's using the port
netstat -an | findstr :3000
netstat -an | findstr :8000

# Kill processes or change ports in docker-compose.yml
```

#### Container Build Fails
```bash
# Clean build without cache
docker-compose build --no-cache

# Remove old containers and rebuild
docker-compose down
docker system prune -f
docker-compose up --build
```

#### Permission Issues (Linux/Mac)
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

#### Frontend Not Loading
1. Check if backend is running: http://localhost:8000/docs
2. Check browser console for API errors
3. Verify environment variables in docker-compose.yml

#### Database/Storage Issues
```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up --build
```

## Production Considerations

To run this in production:

1. **Change environment variables** in docker-compose.yml
2. **Use a reverse proxy** (Nginx/Traefik) in front
3. **Add SSL certificates**
4. **Use production-ready database** instead of in-memory storage
5. **Set up proper logging and monitoring**

## Stopping the Application

```bash
# Stop containers (can be restarted)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```