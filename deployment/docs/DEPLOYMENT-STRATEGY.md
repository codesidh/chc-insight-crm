# CHC Insight CRM - Deployment Strategy

## Infrastructure-First Deployment Strategy

**NEW APPROACH**: Separate persistent infrastructure from application deployments for efficiency and data preservation.

### Why Infrastructure-First?

1. **Data Persistence**: PostgreSQL and Redis data survives application updates
2. **Faster Deployments**: Only rebuild applications, not infrastructure
3. **Development Efficiency**: Keep database state during development
4. **Production Safety**: Reduce risk of data loss during deployments
5. **Resource Efficiency**: Infrastructure runs continuously, apps can be updated

### Two-Layer Architecture

#### Layer 1: Infrastructure (Persistent)
- **PostgreSQL**: Database with persistent volumes
- **Redis**: Cache with persistent volumes
- **Network**: Shared network for communication
- **Lifecycle**: Start once, runs continuously

#### Layer 2: Applications (Frequent Updates)
- **Backend**: Express.js API (connects to infrastructure)
- **Frontend**: Next.js application
- **Lifecycle**: Deploy/update frequently without affecting data

### Deployment Workflows

#### First Time Setup
```powershell
# 1. Start infrastructure (one time)
.\deployment\deploy-master.ps1 infrastructure -InfraAction start

# 2. Deploy applications
.\deployment\deploy-master.ps1 apps

# Or do both at once
.\deployment\deploy-master.ps1 deploy
```

#### Daily Development (Recommended)
```powershell
# Update applications only (preserves database)
.\deployment\deploy-master.ps1 apps

# Restart specific service
.\deployment\deploy-master.ps1 restart -Service backend
```

#### Infrastructure Management
```powershell
# Check status
.\deployment\deploy-master.ps1 status

# Backup data
.\deployment\deploy-master.ps1 backup

# Stop applications (keep infrastructure)
.\deployment\deploy-master.ps1 stop
```
5. **Health Check**: Shows service status after deployment

### Available Actions

- `deploy` - Full deployment with cleanup and verification
- `stop` - Stop all services
- `logs` - View service logs
- `status` - Check service status
- `restart` - Restart all services
- `build-check` - Check build artifact sizes

### Configuration

- **Docker Compose**: `deployment/configs/docker-compose.simple.yml`
- **Environment**: `deployment/configs/.env.production`
- **Services**: PostgreSQL, Redis, Backend, Frontend (no Nginx for simplicity)

### Prerequisites

1. **Backend built**: `npm run build` in backend/ folder
2. **Frontend built**: `npm run build` in frontend/ folder
3. **Docker running**: Docker Desktop or Docker daemon
4. **Environment configured**: `.env.production` with correct variables

### Troubleshooting

#### Common Issues & Solutions

1. **Missing builds**
   ```powershell
   # Build backend
   cd backend
   npm run build
   
   # Build frontend  
   cd frontend
   npm run build
   ```

2. **Environment variable errors**
   - Check `.env.production` has all required variables
   - Ensure JWT secrets are 32+ characters
   - Verify database credentials match

3. **Docker issues**
   ```powershell
   # Clean Docker environment
   .\deployment\deploy-master.ps1 clean-docker -Force
   
   # Check Docker is running
   docker --version
   docker ps
   ```

4. **Container startup failures**
   ```powershell
   # Check logs
   .\deployment\scripts\deploy-minimal.ps1 logs
   
   # Check status
   .\deployment\scripts\deploy-minimal.ps1 status
   
   # Restart services
   .\deployment\scripts\deploy-minimal.ps1 restart
   ```

5. **Database connection issues**
   - Wait 30 seconds after starting for database to be ready
   - Check environment variables: `DATABASE_HOST`, `DATABASE_PASSWORD`
   - Verify PostgreSQL container is running: `docker ps | findstr postgres`

6. **Port conflicts**
   ```powershell
   # Check what's using ports
   netstat -an | findstr :3000
   netstat -an | findstr :3001
   netstat -an | findstr :5432
   
   # Stop conflicting services or change ports in docker-compose.simple.yml
   ```

## Removed Scripts

The following scripts were removed to avoid confusion:

- `deploy-simple.ps1` - Redundant with deploy-minimal.ps1
- `deploy.ps1` - Too complex for our needs
- `deploy.sh` - Not needed on Windows
- `build-for-docker.ps1` - Build locally instead
- `test-mvp-capabilities.ps1` - Not needed
- `analyze-build-size.ps1` - Functionality moved to deploy-minimal.ps1
- `check-build-size.ps1` - Functionality moved to deploy-minimal.ps1

## Environment Variables

The backend expects these variables (all included in `.env.production`):

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (both must be 32+ characters)
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `NODE_ENV=production`

## Success Indicators

After deployment, you should see:

- All services running: `docker ps` shows 4 containers
- Frontend accessible: http://localhost:3000
- Backend accessible: http://localhost:3001
- Database accessible: PostgreSQL on port 5432
- Redis accessible: Redis on port 6379

## Future Deployments

**ALWAYS USE**: `.\deployment\deploy-master.ps1 deploy`

This is the single source of truth for deployments. Do not create new deployment scripts.