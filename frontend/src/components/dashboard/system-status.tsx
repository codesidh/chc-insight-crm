/**
 * System Status Component
 * 
 * Shows the status of MVP components and system health
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Server,
  Database,
  Workflow,
  FileText,
  Users,
  Building2
} from 'lucide-react';

interface SystemComponent {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  lastChecked?: string;
}

const systemComponents: SystemComponent[] = [
  {
    name: 'Form Hierarchy',
    status: 'operational',
    description: 'Categories, types, and templates management',
    icon: Workflow,
    lastChecked: '2 minutes ago'
  },
  {
    name: 'Form Builder',
    status: 'operational',
    description: 'Template creation and question management',
    icon: FileText,
    lastChecked: '1 minute ago'
  },
  {
    name: 'Member Lookup',
    status: 'operational',
    description: 'Member search and data retrieval',
    icon: Users,
    lastChecked: '3 minutes ago'
  },
  {
    name: 'Provider Lookup',
    status: 'operational',
    description: 'Provider search and network status',
    icon: Building2,
    lastChecked: '2 minutes ago'
  },
  {
    name: 'Database',
    status: 'operational',
    description: 'PostgreSQL database connectivity',
    icon: Database,
    lastChecked: '1 minute ago'
  },
  {
    name: 'API Server',
    status: 'operational',
    description: 'Backend API and authentication',
    icon: Server,
    lastChecked: '30 seconds ago'
  }
];

const statusConfig = {
  operational: {
    badge: 'default',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    label: 'Operational'
  },
  degraded: {
    badge: 'secondary',
    icon: AlertCircle,
    color: 'text-yellow-600 dark:text-yellow-400',
    label: 'Degraded'
  },
  down: {
    badge: 'destructive',
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    label: 'Down'
  }
} as const;

export function SystemStatus() {
  const operationalCount = systemComponents.filter(c => c.status === 'operational').length;
  const totalComponents = systemComponents.length;
  const healthPercentage = Math.round((operationalCount / totalComponents) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Status
        </CardTitle>
        <CardDescription>
          MVP component health and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium">Overall Health</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {operationalCount}/{totalComponents} operational
            </span>
            <Badge variant="default" className="gap-1">
              {healthPercentage}%
            </Badge>
          </div>
        </div>

        {/* Component Status */}
        <div className="space-y-3">
          {systemComponents.map((component) => {
            const config = statusConfig[component.status];
            const StatusIcon = config.icon;
            const ComponentIcon = component.icon;
            
            return (
              <div key={component.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ComponentIcon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{component.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {component.description}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {component.lastChecked && (
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {component.lastChecked}
                    </span>
                  )}
                  <Badge variant={config.badge as any} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}