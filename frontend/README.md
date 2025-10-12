# CHC Insight CRM - Frontend

This is the frontend application for CHC Insight CRM, built with Next.js 15, React 18, and TypeScript.

## Features

- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Strict TypeScript** configuration matching backend
- **ESLint & Prettier** for code quality
- **Path aliases** for clean imports
- **Environment configuration** for different deployment stages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building

```bash
npm run build
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run analyze` - Analyze bundle size

## Project Structure

```
src/
├── app/                    # Next.js 15 app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── charts/           # Chart components
│   └── features/         # Feature-specific components
├── lib/                  # Utility libraries
│   ├── api.ts           # API client
│   └── utils.ts         # Utility functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── config/              # Application configuration
├── styles/              # Additional styles
└── providers/           # React context providers
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_BETA_FEATURES=false
```

### Path Aliases

The following path aliases are configured:

- `@/*` - src/\*
- `@/components/*` - src/components/\*
- `@/lib/*` - src/lib/\*
- `@/hooks/*` - src/hooks/\*
- `@/types/*` - src/types/\*
- `@/utils/*` - src/utils/\*
- `@/config/*` - src/config/\*

## Development Guidelines

### Code Style

- Use TypeScript with strict mode enabled
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries
- Use proper TypeScript types (avoid `any`)

### Component Structure

- Keep components small and focused
- Use composition over inheritance
- Implement proper prop types
- Use custom hooks for business logic
- Follow the single responsibility principle

### Performance

- Use React.memo for expensive components
- Implement proper loading states
- Use Next.js Image component for images
- Implement code splitting where appropriate
- Use proper caching strategies

## Next Steps

This frontend is ready for the next development phases:

1. **shadcn/ui Setup** (Task 3.2)
2. **State Management** (Task 3.3)
3. **Survey Builder Components** (Task 11.1)
4. **Dashboard Components** (Task 13.1)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
