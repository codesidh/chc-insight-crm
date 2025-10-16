# Deployment Standards and Guidelines

## Overview

This document establishes deployment standards, practices, and guidelines for the CHC Insight CRM application. All deployment-related work should follow these standards to ensure consistent, reliable, and secure deployments across all environments.

## Documentation Organization Rule

**MANDATORY**: All deployment documentation MUST be organized in the `deployment/docs/` folder.

### Documentation Structure
```
deployment/
├── docs/                           # ALL documentation goes here
│   ├── README.md                   # Primary deployment documentation
│   └── DEPLOYMENT-STRATEGY.md      # Complete deployment strategy guide
├── scripts/                        # Deployment scripts only
├── configs/                        # Configuration files only
└── deploy-master.ps1               # Master deployment script only
```

### Documentation Rules
1. **Single Source of Truth**: `deployment/docs/README.md` is the primary deployment documentation
2. **Complete Strategy**: `deployment/docs/DEPLOYMENT-STRATEGY.md` contains the full deployment strategy
3. **No Root Documentation**: No `.md` files in `deployment/` root except `deploy-master.ps1`
4. **Consolidated Information**: All troubleshooting, guides, and references in `docs/` folder
5. **Clear References**: Scripts and configs reference documentation in `docs/` folder

### Enforcement
- All deployment documentation must be in `deployment/docs/`
- No duplicate documentation files
- Clear, concise documentation focused on the primary deployment method
- Regular cleanup of outdated or redundant documentation
- Scripts must reference documentation in `docs/` folder
- No `.md` files in deployment root or scripts folders

## Deployment Architecture

### Environment Strategy
- **Development**: Local development with Docker Compose
- **Staging**: Pre-production environment for testing
- **Production**: Live environment with high availability requirements

### Container Strategy
- **Frontend**: Next.js application in Node.js Alpine container
- **Backend**: Express.js API in Node.js Alpine container
- **Database**: PostgreSQL with persistent volumes
- **Cache**: Redis for session management and caching
- **Reverse Proxy**: Nginx for load balancing and SSL termination

## Deployment Structure

### Mandatory Folder Organization
```
deployment/
├── scripts/                  # Deployment automation scripts
│   ├── deploy.ps1           # Windows PowerShell deployment
│   ├── deploy.sh            # Unix/Linux deployment
│   ├── docker-cleanup.ps1   # Windows Docker cleanup
│   ├── docker-cleanup.sh    # Unix/Linux Docker cleanup
│   ├── docker-cleanup.bat   # Windows batch cleanup
│   ├── health-check.ps1     # Windows health monitoring
│   ├── health-check.sh      # Unix/Linux health monitoring
│   ├── backup.ps1           # Windows backup script
│   └── backup.sh            # Unix/Linux backup script
├── configs/                 # Environment configurations
│   ├── docker-compose.production.yml
│   ├── docker-compose.staging.yml
│   ├── .env.production      # Production environment variables
│   ├── .env.staging         # Staging environment variables
│   └── nginx.conf           # Nginx configuration
├── docs/                    # Deployment documentation
│   ├── DEPLOYMENT-GUIDE.md  # Comprehensive deployment guide
│   ├── DOCKER-CLEANUP-README.md
│   ├── TROUBLESHOOTING.md   # Common issues and solutions
│   └── SECURITY.md          # Security considerations
├── README.md                # Quick start guide
└── deploy-master.ps1        # Master deployment orchestrator
```

## Docker Standards

### Dockerfile Requirements
- **Base Images**: Use official Node.js Alpine images for smaller footprint
- **Build Strategy**: Build applications locally, copy only built artifacts to containers
- **Security**: Run as non-root user, minimal attack surface
- **Optimization**: Minimal layer count, efficient .dockerignore configuration
- **Dependencies**: Install only production dependencies in containers
- **Artifacts**: Copy pre-built dist/ (backend) and .next/standalone/ + .next/static/ (frontend)
- **Size Optimization**: Frontend builds should be ~12MB, not 400MB+ (remove .next/cache/)
- **Path Resolution**: Backend requires TypeScript path alias resolution post-compilation

### Docker Compose Standards
- **Version**: Use Compose file format version 3.8+
- **Networks**: Custom networks for service isolation
- **Volumes**: Named volumes for data persistence
- **Environment**: Separate env files for each environment
- **Health Checks**: Implement health checks for all services
- **Resource Limits**: Set memory and CPU limits

### Container Naming Convention
- **Format**: `chc-crm-{service}-{environment}`
- **Examples**: `chc-crm-frontend-prod`, `chc-crm-backend-staging`

## Environment Configuration

### Environment Variables
**MANDATORY**: All configuration must use environment variables, never hardcoded values.

#### Required Variables
```bash
# Application
NODE_ENV=production
PORT=3000
API_URL=https://api.example.com

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=chc_insight_crm
DB_USER=postgres
DB_PASSWORD=secure_password

# Authentication
JWT_SECRET=your-super-secure-jwt-secret
JWT_EXPIRES_IN=24h

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Security
CORS_ORIGIN=https://yourdomain.com
HELMET_CSP_DIRECTIVES=default-src 'self'
```

#### Environment File Security
- **Production**: Never commit .env.production to version control
- **Templates**: Provide .env.example files with dummy values
- **Secrets Management**: Use Docker secrets or external secret management
- **Validation**: Validate all required environment variables on startup

## Deployment Scripts Standards

### Primary Deployment Script
**MANDATORY**: Use `deploy-minimal.ps1` as the primary deployment script for all deployments.

**REFERENCE**: See `deployment/docs/DEPLOYMENT-STRATEGY.md` for complete deployment strategy and troubleshooting.

#### Why deploy-minimal.ps1?
- **Efficient**: Uses pre-built artifacts instead of rebuilding in Docker
- **Fast**: Leverages existing builds and workspace node_modules
- **Reliable**: Includes automatic cleanup and path fixing
- **Simple**: Minimal dependencies and clear workflow
- **Proven**: Successfully tested and optimized for our stack

#### Script Workflow
1. **Clean Docker Environment**: Automatically runs `docker-cleanup.ps1 -Force`
2. **Verify Builds**: Checks that backend/dist and frontend/.next/standalone exist
3. **Fix Paths**: Runs `fix-backend-paths.ps1` to resolve TypeScript aliases
4. **Deploy**: Uses `docker-compose.simple.yml` for lightweight deployment

#### Available Actions
- **`deploy`**: Full deployment with cleanup and verification
- **`stop`**: Stop all services
- **`logs`**: View service logs
- **`status`**: Check service status
- **`restart`**: Restart all services
- **`build-check`**: Check build artifact sizes

#### Usage Examples
```powershell
# Primary deployment command
.\deployment\deploy-master.ps1 deploy

# Or directly
.\deployment\scripts\deploy-minimal.ps1 deploy

# Other actions
.\deployment\deploy-master.ps1 stop
.\deployment\deploy-master.ps1 logs
.\deployment\deploy-master.ps1 status
```

#### Existing Scripts to Reuse
- **`deploy-minimal.ps1`**: **PRIMARY** - Main deployment script
- **`docker-cleanup.ps1/.sh/.bat`**: **MANDATORY** - Use before every deployment
- **`health-check.ps1/.sh`**: Use for all health monitoring
- **`backup.ps1/.sh`**: Use for all backup operations
- **`fix-backend-paths.ps1`**: Use to resolve TypeScript path aliases post-compilation

#### Deployment Script Integration
**MANDATORY**: All deployment scripts must automatically call cleanup scripts:
```powershell
# Example integration in deployment scripts
& "$ScriptDir\docker-cleanup.ps1" -Force
& "$ScriptDir\fix-backend-paths.ps1"
```

### Cross-Platform Support
**MANDATORY**: All deployment scripts must support both Windows and Unix/Linux systems.

#### Script Naming Convention
- **PowerShell**: `.ps1` extension for Windows
- **Bash**: `.sh` extension for Unix/Linux
- **Batch**: `.bat` extension for Windows fallback

#### Script Requirements
- **Error Handling**: Proper error handling and exit codes
- **Logging**: Comprehensive logging with timestamps
- **Rollback**: Ability to rollback failed deployments
- **Validation**: Pre-deployment validation checks
- **Safety**: Confirmation prompts for destructive operations
- **Reusability**: Scripts must be parameterized for different environments

### Deployment Process Flow
1. **Pre-deployment Cleanup**
   - **MANDATORY**: Run Docker cleanup script before every deployment
   - Remove all containers, images, volumes, and build cache
   - Ensures clean deployment environment without conflicts

2. **Local Build Process**
   - Build frontend application locally (creates .next/ folder)
   - Build backend application locally (creates dist/ folder)
   - **CRITICAL**: Fix TypeScript path aliases in compiled backend code
   - Remove build cache from frontend (.next/cache/ folder)
   - Verify build outputs exist and are complete

3. **Environment Configuration**
   - Validate all required environment variables are set
   - Ensure backend and Docker Compose use consistent variable names
   - Check Docker daemon status and network connectivity

4. **Docker Deployment**
   - Use lightweight runtime-only Dockerfiles
   - Copy only essential pre-built artifacts (dist/, .next/standalone/, .next/static/, public/)
   - Install minimal production dependencies in containers
   - Deploy services with health checks and resource limits

5. **Post-deployment Validation**
   - Health checks for all services
   - Service status verification
   - Log monitoring for startup issues
   - Rollback if validation fails

## Database Deployment Standards

### Migration Strategy
- **Automated**: Migrations run automatically during deployment
- **Rollback**: All migrations must be reversible
- **Testing**: Test migrations on staging before production
- **Backup**: Always backup before running migrations

### Migration Commands
```bash
# Development
npm run db:migrate

# Production
npm run db:migrate:prod

# Rollback
npm run db:rollback
```

## Security Standards

### Container Security
- **Non-root User**: All containers run as non-root user
- **Minimal Base**: Use minimal base images (Alpine)
- **Secrets**: Use Docker secrets for sensitive data
- **Network Isolation**: Services communicate through custom networks
- **Read-only Filesystem**: Where possible, use read-only filesystems

### SSL/TLS Requirements
- **HTTPS Only**: All production traffic must use HTTPS
- **Certificate Management**: Automated certificate renewal
- **Security Headers**: Implement security headers via Nginx
- **HSTS**: HTTP Strict Transport Security enabled

### Access Control
- **Principle of Least Privilege**: Minimal required permissions
- **Network Segmentation**: Isolate services by function
- **Firewall Rules**: Restrict access to necessary ports only
- **Audit Logging**: Log all deployment activities

## Monitoring and Health Checks

### Health Check Requirements
**MANDATORY**: All services must implement health check endpoints.

#### Health Check Endpoints
- **Frontend**: `GET /health` - Returns application status
- **Backend**: `GET /api/health` - Returns API and database status
- **Database**: Built-in PostgreSQL health checks
- **Redis**: Built-in Redis health checks

#### Monitoring Scripts
- **Continuous Monitoring**: Scripts for ongoing health monitoring
- **Alerting**: Integration with monitoring systems
- **Metrics Collection**: Performance and availability metrics
- **Log Aggregation**: Centralized logging for troubleshooting

## Backup and Recovery

### Backup Strategy
- **Automated Backups**: Daily automated database backups
- **Retention Policy**: 30 days for daily, 12 months for monthly
- **Offsite Storage**: Backups stored in separate location
- **Encryption**: All backups encrypted at rest

### Recovery Procedures
- **RTO**: Recovery Time Objective < 4 hours
- **RPO**: Recovery Point Objective < 1 hour
- **Testing**: Regular recovery testing
- **Documentation**: Detailed recovery procedures

## Performance Standards

### Resource Allocation
- **Frontend**: 512MB RAM, 0.5 CPU cores
- **Backend**: 1GB RAM, 1 CPU core
- **Database**: 2GB RAM, 1 CPU core
- **Redis**: 256MB RAM, 0.25 CPU cores

### Scaling Strategy
- **Horizontal Scaling**: Multiple container instances
- **Load Balancing**: Nginx load balancer
- **Auto-scaling**: Based on CPU and memory metrics
- **Database Scaling**: Read replicas for read-heavy workloads

## Troubleshooting Guidelines

### Common Issues
1. **Container Startup Failures**
   - Check environment variables
   - Verify network connectivity
   - Review container logs

2. **Database Connection Issues**
   - Validate database credentials
   - Check network connectivity
   - Verify database service status

3. **Performance Issues**
   - Monitor resource usage
   - Check database query performance
   - Review application logs

### Diagnostic Commands
```bash
# Container status
docker ps -a

# Service logs
docker-compose logs -f [service]

# Resource usage
docker stats

# Network connectivity
docker exec [container] ping [target]
```

## Compliance Requirements

### HIPAA Compliance
- **Data Encryption**: All data encrypted in transit and at rest
- **Access Logging**: All access to PHI logged
- **Audit Trails**: Comprehensive audit trails maintained
- **Data Backup**: Secure backup procedures for PHI

### Security Auditing
- **Regular Scans**: Automated security scanning
- **Vulnerability Management**: Regular updates and patches
- **Penetration Testing**: Annual penetration testing
- **Compliance Reporting**: Regular compliance assessments

## Documentation Requirements

### Deployment Documentation
- **Runbooks**: Step-by-step deployment procedures
- **Architecture Diagrams**: System architecture documentation
- **Configuration Guide**: Environment configuration guide
- **Troubleshooting Guide**: Common issues and solutions

### Change Management
- **Change Logs**: Document all deployment changes
- **Version Control**: Tag all deployment versions
- **Rollback Procedures**: Document rollback procedures
- **Testing Results**: Document testing results

## Enforcement Rules

### Mandatory Checks
- All deployments must use provided scripts
- Environment variables must be validated
- Health checks must pass before deployment completion
- Backups must be created before major deployments
- Security scans must pass before production deployment

### Prohibited Actions
- Manual deployment steps in production
- Hardcoded configuration values
- Deployment without backup
- Skipping health checks
- Direct database modifications in production
- **Creating duplicate scripts when existing ones can be enhanced**
- **Bypassing existing deployment automation**
- **Creating new scripts without checking existing functionality first**

### Code Review Requirements
- All deployment scripts must be reviewed
- Configuration changes must be approved
- Security implications must be assessed
- Performance impact must be evaluated
- Rollback procedures must be tested

This deployment standard ensures consistent, secure, and reliable deployments across all environments while maintaining compliance with healthcare regulations and security best practices.
## Lesson
s Learned from Recent Experience

### Critical Issues Discovered and Resolved

#### 1. Frontend Build Size Bloat (494MB → 12MB)
**Problem**: Next.js builds were including massive cache directories
**Root Cause**: `.next/cache/` folder (482MB) was being included in Docker builds
**Solution**: 
- Remove `.next/cache/` before Docker deployment
- Update .dockerignore to exclude cache, diagnostics, and types folders
- Only copy `.next/standalone/`, `.next/static/`, and `public/` to Docker

#### 2. TypeScript Path Alias Resolution
**Problem**: Compiled JavaScript still contained `@/` imports that Node.js couldn't resolve
**Root Cause**: TypeScript compiler doesn't resolve path aliases by default
**Solution**: 
- Created `fix-backend-paths.ps1` script to post-process compiled JavaScript
- Replace `@/` imports with relative paths after TypeScript compilation
- Integrate path fixing into deployment workflow

#### 3. Environment Variable Naming Inconsistency
**Problem**: Backend expected `DATABASE_HOST` but Docker Compose used `DB_HOST`
**Root Cause**: Inconsistent naming conventions between application and deployment configs
**Solution**: 
- Standardize on backend's expected variable names
- Update .env files to include both formats for compatibility
- Document required environment variables clearly

#### 4. Docker Build Performance
**Problem**: Initial Docker builds took 560+ seconds due to npm installs in containers
**Root Cause**: Building applications inside Docker instead of copying pre-built artifacts
**Solution**: 
- Build applications locally using workspace node_modules
- Copy only compiled artifacts to Docker (dist/, .next/standalone/)
- Reduced build time from 560s to 1.7s (99.7% improvement)

#### 5. npm Workspace Compatibility
**Problem**: Individual workspace package.json files don't have package-lock.json
**Root Cause**: npm workspaces manage dependencies at root level
**Solution**: 
- Use `npm install` instead of `npm ci` in Dockerfiles
- Build locally using workspace structure, copy artifacts to Docker
- Avoid npm operations inside Docker containers when possible

### Updated Best Practices

#### Docker Build Optimization
1. **Always clean Docker environment** before deployment using existing cleanup scripts
2. **Build locally first** - leverage workspace node_modules and faster local builds
3. **Copy minimal artifacts** - only dist/, .next/standalone/, .next/static/, public/
4. **Remove build cache** - exclude .next/cache/, diagnostics/, types/ folders
5. **Fix path aliases** - post-process TypeScript compilation for runtime compatibility

#### Environment Configuration
1. **Consistent naming** - align environment variable names between app and deployment
2. **Required variables** - document and validate all required environment variables
3. **Default values** - provide sensible defaults in Docker Compose files
4. **Security** - never commit production secrets, use templates

#### Performance Targets
- **Frontend build**: ~12MB (not 400MB+)
- **Backend build**: ~1.2MB
- **Docker build time**: <10 seconds (not minutes)
- **Total deployment time**: <2 minutes including cleanup

#### Script Integration Requirements
All deployment scripts must:
1. Call `docker-cleanup.ps1 -Force` before deployment
2. Verify build artifacts exist locally
3. Fix TypeScript path aliases for backend
4. Validate environment variables
5. Provide clear success/failure feedback
6. Include health checks and status verification

This experience demonstrates the importance of optimizing the build process outside of Docker and using containers only for runtime deployment of pre-built artifacts.