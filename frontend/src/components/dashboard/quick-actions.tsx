/**
 * Quick Actions Component
 * 
 * Provides quick access to key MVP features
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Plus, 
  Users, 
  Building2,
  Search,
  Settings,
  BarChart3,
  Workflow
} from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    title: 'Form Builder',
    description: 'Create and manage form templates',
    icon: FileText,
    href: '/surveys/form-builder',
    color: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
  },
  {
    title: 'Create Survey',
    description: 'Start a new form instance',
    icon: Plus,
    href: '/surveys',
    color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
  },
  {
    title: 'Member Lookup',
    description: 'Search and manage members',
    icon: Users,
    href: '/members',
    color: 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
  },
  {
    title: 'Provider Lookup',
    description: 'Search and manage providers',
    icon: Building2,
    href: '/providers',
    color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400'
  },
  {
    title: 'Form Hierarchy',
    description: 'Manage categories and types',
    icon: Workflow,
    href: '/surveys/hierarchy',
    color: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
  },
  {
    title: 'Analytics',
    description: 'View reports and insights',
    icon: BarChart3,
    href: '/analytics',
    color: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400'
  }
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Access key features and tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            
            return (
              <Link key={action.title} href={action.href}>
                <Card className="transition-all hover:shadow-md cursor-pointer border-muted hover:border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{action.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}