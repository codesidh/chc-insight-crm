import type { NextPage } from 'next'
import { UIDemo } from '@/components/ui-demo'

const HomePage: NextPage = () => {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to CHC Insight CRM
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Comprehensive CRM application for Long-Term Services and Supports (LTSS)
          </p>
          <div className="space-y-4">
            <p className="text-foreground">
              This application features a dynamic survey engine, workflow management, 
              role-based access control, and comprehensive reporting capabilities.
            </p>
            <p className="text-sm text-muted-foreground">
              Frontend infrastructure with Next.js 14, TypeScript, shadcn/ui, and oklch color system.
            </p>
          </div>
        </div>
        
        <UIDemo />
      </div>
    </main>
  )
}

export default HomePage