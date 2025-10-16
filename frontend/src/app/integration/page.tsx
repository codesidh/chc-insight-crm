'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { MVPIntegrationDashboard } from '@/components/features/mvp-integration/mvp-integration-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Users, 
  BarChart3,
  Settings,
  Workflow,
  Play
} from 'lucide-react';
import Link from 'next/link';

export default function IntegrationPage() {
  const mvpWorkflow = [
    {
      step: 1,
      title: 'Form Hierarchy Setup',
      description: 'Create Categories (Cases/Assessments) → Types → Templates',
      link: '/surveys',
      icon: FileText,
      status: 'completed'
    },
    {
      step: 2,
      title: 'Form Builder',
      description: 'Design dynamic forms with drag-and-drop interface',
      link: '/surveys/form-builder',
      icon: Settings,
      status: 'completed'
    },
    {
      step: 3,
      title: 'Form Execution',
      description: 'Complete form instances with auto-save and validation',
      link: '/surveys/execution',
      icon: Play,
      status: 'completed'
    },
    {
      step: 4,
      title: 'Member/Provider Lookup',
      description: 'Search and pre-populate data from staging systems',
      link: '/members',
      icon: Users,
      status: 'completed'
    },
    {
      step: 5,
      title: 'Workflow Management',
      description: 'Approval processes and task assignment',
      link: '/work-queue',
      icon: Workflow,
      status: 'completed'
    },
    {
      step: 6,
      title: 'Dashboard Analytics',
      description: 'Track completion metrics and performance',
      link: '/dashboard',
      icon: BarChart3,
      status: 'completed'
    }
  ];

  return (
    <AppLayout headerTitle="MVP Integration">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              
              {/* Header Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">MVP Integration Center</h1>
                  <p className="text-muted-foreground text-lg">
                    Test and verify end-to-end functionality of all MVP components
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    All Components Ready
                  </Badge>
                  <Badge variant="secondary">
                    6 MVP Features Integrated
                  </Badge>
                </div>
              </div>

              {/* MVP Workflow Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>MVP Workflow Overview</CardTitle>
                  <CardDescription>
                    Complete end-to-end workflow from form creation to analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mvpWorkflow.map((step, index) => {
                      const Icon = step.icon;
                      const isLast = index === mvpWorkflow.length - 1;
                      
                      return (
                        <div key={step.step} className="relative">
                          <Link href={step.link}>
                            <Card className="transition-all hover:shadow-lg cursor-pointer h-full">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                      {step.step}
                                    </div>
                                    <Badge variant="default" className="bg-green-600">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Ready
                                    </Badge>
                                  </div>
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-base">{step.title}</CardTitle>
                                <CardDescription className="text-sm">
                                  {step.description}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </Link>
                          
                          {!isLast && (
                            <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Integration Testing Dashboard */}
              <MVPIntegrationDashboard />

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Test individual components or complete workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/surveys/form-builder">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Settings className="h-4 w-4" />
                        Test Form Builder
                      </Button>
                    </Link>
                    
                    <Link href="/members">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" />
                        Test Member Lookup
                      </Button>
                    </Link>
                    
                    <Link href="/work-queue">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Workflow className="h-4 w-4" />
                        Test Workflows
                      </Button>
                    </Link>
                    
                    <Link href="/dashboard">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Test Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Integration Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle>Integration Checklist</CardTitle>
                  <CardDescription>
                    Verify all MVP requirements are met
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        category: 'Form Management',
                        items: [
                          'Hierarchical form structure (Categories → Types → Templates → Instances)',
                          'Form builder with drag-and-drop interface',
                          'Question types: text, select, yes/no',
                          'Form template versioning and copying',
                          'Form instance creation and management'
                        ]
                      },
                      {
                        category: 'Data Integration',
                        items: [
                          'Member search with type-ahead functionality',
                          'Provider search and lookup',
                          'Data pre-population from staging systems',
                          'Context-aware form data loading'
                        ]
                      },
                      {
                        category: 'Workflow & Analytics',
                        items: [
                          'Basic approval workflows',
                          'Task assignment and management',
                          'Dashboard metrics and charts',
                          'Form completion tracking',
                          'User role-based access control'
                        ]
                      },
                      {
                        category: 'Technical Integration',
                        items: [
                          'Frontend-backend API connectivity',
                          'Database operations and queries',
                          'Error handling and user feedback',
                          'Authentication and session management',
                          'Multi-tenant data isolation'
                        ]
                      }
                    ].map((section, sectionIndex) => (
                      <div key={sectionIndex} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                          {section.category}
                        </h4>
                        <div className="grid gap-2 md:grid-cols-2">
                          {section.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}