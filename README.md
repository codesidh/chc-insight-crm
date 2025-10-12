# CHC Insight CRM

A comprehensive CRM application designed for Long-Term Services and Supports (LTSS) business within Managed Care Organization (MCO) environments. The system captures survey/assessment data to meet state requirements while tracking member, provider, and internal performance metrics.

## Features

- **Dynamic Survey Engine**: Create and manage surveys with various question types and conditional logic
- **Workflow Management**: Configurable approval workflows with role-based task assignment
- **Role-Based Access Control**: Multi-tenant architecture with granular permissions
- **Data Pre-population**: Auto-populate member and provider data from staging systems
- **Comprehensive Reporting**: Executive dashboards, custom reports, and performance analytics
- **HIPAA Compliance**: Secure data handling with audit trails and encryption
- **Modern UI**: Built with Next.js 14, shadcn/ui, and Tailwind CSS

## Architecture

This is a monorepo containing:

- **Frontend**: Next.js 14 application with TypeScript, shadcn/ui, and TanStack libraries
- **Backend**: Node.js/Express API with TypeScript, PostgreSQL, and Redis
- **Docs**: Project documentation and specifications

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: shadcn/ui with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Forms**: TanStack Form with Zod validation
- **Charts**: Recharts with shadcn chart components
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **Authentication**: JWT with Passport.js
- **Queue**: Bull Queue for background jobs

### Infrastructure
- **Containerization**: Docker
- **Reverse Proxy**: NGINX
- **Process Management**: PM2
- **Monitoring**: Prometheus/Grafana

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14 or higher)
- **Redis** (v6 or higher)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/chc-insight-crm.git
cd chc-insight-crm
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Environment Setup

Copy the environment template files and configure them:

```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env.local
```

Edit the environment files with your database credentials and other configuration.

### 4. Database Setup

```bash
# Start PostgreSQL and Redis services
# Create database and run migrations
cd backend
npm run db:migrate
npm run db:seed
```

### 5. Start Development Servers

```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend API on http://localhost:3001
```

## Development

### Project Structure

```
chc-insight-crm/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js 14 app directory
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities and configurations
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── migrations/          # Database migrations
│   ├── seeds/               # Database seed data
│   └── package.json
├── docs/                     # Documentation
├── .kiro/                    # Kiro specifications
└── package.json             # Root package.json with workspaces
```

### Available Scripts

#### Root Level Commands

```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run test             # Run tests for both applications
npm run lint             # Lint both applications
npm run clean            # Clean all build artifacts and node_modules
```

#### Frontend Commands

```bash
npm run dev:frontend     # Start frontend development server
npm run build:frontend   # Build frontend for production
npm run test:frontend    # Run frontend tests
```

#### Backend Commands

```bash
npm run dev:backend      # Start backend development server
npm run build:backend    # Build backend for production
npm run test:backend     # Run backend tests
```

### Code Style and Linting

This project uses ESLint and Prettier for code formatting and linting. Configuration is shared between frontend and backend workspaces.

```bash
npm run lint             # Check for linting errors
npm run lint:fix         # Fix auto-fixable linting errors
```

### Testing

```bash
npm run test             # Run all tests
npm run test:frontend    # Run frontend tests (Vitest)
npm run test:backend     # Run backend tests (Jest)
```

## Deployment

### Production Build

```bash
npm run build
```

### Docker Deployment

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d
```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/chc_insight
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=CHC Insight CRM
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and tests
- Update documentation as needed

## Security

This application handles protected health information (PHI) and must comply with HIPAA regulations. Key security features include:

- End-to-end encryption for data transmission
- Secure password hashing and storage
- Role-based access control with multi-tenant isolation
- Comprehensive audit logging
- Session management and timeout enforcement
- Input validation and SQL injection prevention

## Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` directory

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

**CHC Insight CRM** - Streamlining healthcare compliance and quality management.