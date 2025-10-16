# CHC Insight CRM - Deployment

Simple, reliable deployment for the CHC Insight CRM application.

## 🚀 Quick Start

**Primary deployment command:**
```powershell
.\deployment\deploy-master.ps1 deploy
```

## 📁 Directory Structure

```
deployment/
├── scripts/
│   ├── deploy-minimal.ps1     # PRIMARY deployment script
│   ├── docker-cleanup.ps1     # Docker cleanup utilities
│   ├── fix-backend-paths.ps1  # TypeScript path resolver
│   ├── health-check.ps1       # Health monitoring
│   └── backup.ps1             # Database backup
├── configs/
│   ├── docker-compose.simple.yml  # Docker Compose (PRIMARY)
│   ├── .env.production            # Environment variables
│   └── nginx.conf                 # Nginx configuration
├── docs/                          # All documentation
│   ├── README.md                  # This file
│   └── DEPLOYMENT-STRATEGY.md     # Complete deployment guide
└── deploy-master.ps1              # Master deployment script
```

## 📋 Available Commands

```powershell
# Deploy application
.\deployment\deploy-master.ps1 deploy

# Stop services
.\deployment\deploy-master.ps1 stop

# View logs
.\deployment\deploy-master.ps1 logs

# Check health
.\deployment\deploy-master.ps1 health

# Clean Docker environment
.\deployment\deploy-master.ps1 clean-docker -Force

# Check service status
.\deployment\scripts\deploy-minimal.ps1 status
```

## 📖 Documentation

- **[DEPLOYMENT-STRATEGY.md](DEPLOYMENT-STRATEGY.md)** - Complete deployment strategy and troubleshooting guide

## 🎯 Key Points

- **Use `deploy-minimal.ps1`** as the primary deployment script
- **Pre-build applications** locally before deployment
- **Clean Docker environment** before each deployment
- **Uses `docker-compose.simple.yml`** for lightweight deployment
- **Includes automatic cleanup and path fixing**

## 🔧 Prerequisites

1. **Backend built**: `npm run build` in backend/ folder
2. **Frontend built**: `npm run build` in frontend/ folder  
3. **Docker running**: Docker Desktop or Docker daemon
4. **Environment configured**: `.env.production` with correct variables

## 🆘 Quick Troubleshooting

1. **Missing builds**: Run `npm run build` in backend/ and frontend/
2. **Environment errors**: Check `.env.production` has all required variables
3. **Docker issues**: Run `.\deployment\deploy-master.ps1 clean-docker -Force`
4. **Service issues**: Check logs with `.\deployment\deploy-master.ps1 logs`

For detailed troubleshooting, see [DEPLOYMENT-STRATEGY.md](DEPLOYMENT-STRATEGY.md).