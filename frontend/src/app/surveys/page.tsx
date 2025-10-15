"use client"

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit, 
  Copy,
  FolderTree,
  Settings,
  Play
} from 'lucide-react';
import Link from 'next/link';

export default function SurveysPage() {
  return (
    <AppLayout headerTitle="Surveys">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Form Management</h1>
              <p className="text-muted-foreground text-lg">
                Manage hierarchical forms: Categories → Types → Templates → Instances
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/surveys/form-builder">
                <Button variant="outline">
                  Form Builder
                </Button>
              </Link>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Form
              </Button>
            </div>
          </div>

          {/* MVP Form Hierarchy Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <FolderTree className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Cases & Assessments
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Form Types</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  Active form types
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+3</span> this month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instances</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">247</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+23</span> this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Form Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Form Categories</CardTitle>
              <CardDescription>
                Navigate the hierarchical form structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Cases Category */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FolderTree className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Cases</h4>
                      <p className="text-sm text-muted-foreground">
                        Case management and tracking forms
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">4 Types</Badge>
                        <Badge variant="secondary">7 Templates</Badge>
                        <Badge variant="outline">142 Instances</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Assessments Category */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Assessments</h4>
                      <p className="text-sm text-muted-foreground">
                        Member and provider assessment forms
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">4 Types</Badge>
                        <Badge variant="secondary">5 Templates</Badge>
                        <Badge variant="outline">105 Instances</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Form Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Form Templates</CardTitle>
              <CardDescription>
                Recently created and modified form templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Member Satisfaction Survey</h4>
                      <p className="text-sm text-muted-foreground">
                        Cases → Member Feedback → Satisfaction Template
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">Active</Badge>
                        <span className="text-xs text-muted-foreground">
                          15 questions • Created Dec 1, 2024
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                      <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">Provider Quality Assessment</h4>
                      <p className="text-sm text-muted-foreground">
                        Assessments → Provider Review → Quality Template
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">Draft</Badge>
                        <span className="text-xs text-muted-foreground">
                          28 questions • Created Nov 28, 2024
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MVP Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/surveys/form-builder">
              <Card className="transition-all hover:shadow-lg cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Settings className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Form Builder</CardTitle>
                      <CardDescription>
                        Create and edit form templates
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Create Instance</CardTitle>
                    <CardDescription>
                      Start a new form instance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="transition-all hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                    <FolderTree className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Manage Hierarchy</CardTitle>
                    <CardDescription>
                      Organize categories and types
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}