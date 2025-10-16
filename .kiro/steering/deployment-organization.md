# Deployment Organization Rule

## MANDATORY: Documentation Organization

All deployment documentation MUST be organized in the `deployment/docs/` folder.

### Structure Rule
```
deployment/
├── docs/                           # ALL documentation goes here
│   ├── README.md                   # Primary deployment documentation
│   └── DEPLOYMENT-STRATEGY.md      # Complete deployment strategy guide
├── scripts/                        # Deployment scripts only (no .md files)
├── configs/                        # Configuration files only (no .md files)
└── deploy-master.ps1               # Master deployment script only
```

### Key Rules

1. **Single Documentation Location**: All `.md` files go in `deployment/docs/`
2. **No Root Documentation**: No `.md` files in `deployment/` root
3. **No Script Documentation**: No `.md` files in `deployment/scripts/`
4. **No Config Documentation**: No `.md` files in `deployment/configs/`
5. **Clear References**: Scripts reference documentation using relative paths to `docs/`

### Infrastructure-First Deployment Method

**RECOMMENDED WORKFLOW**:

1. **First Time**: `.\deployment\deploy-master.ps1 deploy` (sets up everything)
2. **Daily Development**: `.\deployment\deploy-master.ps1 apps` (updates apps only)
3. **Quick Restart**: `.\deployment\deploy-master.ps1 restart -Service backend`

**Key Benefits**:
- Infrastructure (PostgreSQL, Redis) persists across deployments
- Faster application updates (no database recreation)
- Data preservation during development
- Separate infrastructure and application lifecycles

### Documentation Files

- **`deployment/docs/README.md`** - Primary deployment documentation with quick start
- **`deployment/docs/DEPLOYMENT-STRATEGY.md`** - Complete strategy, troubleshooting, and details

### Violation Examples

❌ **WRONG**:
```
deployment/
├── README.md                    # Should be in docs/
├── TROUBLESHOOTING.md          # Should be in docs/
├── scripts/
│   └── SCRIPT-GUIDE.md         # Should be in docs/
└── configs/
    └── CONFIG-GUIDE.md         # Should be in docs/
```

✅ **CORRECT**:
```
deployment/
├── docs/
│   ├── README.md               # All documentation here
│   └── DEPLOYMENT-STRATEGY.md  # All documentation here
├── scripts/                    # Scripts only
└── configs/                    # Configs only
```

### Enforcement

When working with deployment:
1. Check `deployment/docs/README.md` first
2. Add new documentation to `deployment/docs/`
3. Remove any `.md` files from other deployment folders
4. Update script references to point to `docs/` folder
5. Keep documentation consolidated and current

This rule ensures clean organization and single source of truth for deployment information.