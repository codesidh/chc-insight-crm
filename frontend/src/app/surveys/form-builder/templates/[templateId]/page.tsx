'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateManagement } from '@/components/features/form-builder/template-management';
import { TemplateComparison } from '@/components/features/form-builder/template-comparison';
import { FormPreview } from '@/components/features/form-builder/form-preview';
import { 
  ArrowLeft, 
  Edit, 
  Copy,
  GitBranch,
  Settings,
  FileText
} from 'lucide-react';
import { FormTemplate } from '@/types';
import formHierarchyData from '@/data/app/form_hierarchy_data.json';

export default function TemplateManagementPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params['templateId'] as string;
  
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [allVersions, setAllVersions] = useState<FormTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load template and all its versions
    const currentTemplate = formHierarchyData.templates.find(
      t => t.id === templateId
    );
    
    if (currentTemplate) {
      // Convert string dates to Date objects
      const convertedTemplate: FormTemplate = {
        ...currentTemplate,
        effectiveDate: new Date(currentTemplate.effectiveDate),
        expirationDate: currentTemplate.expirationDate ? new Date(currentTemplate.expirationDate) : undefined
      } as FormTemplate;
    
      setTemplate(convertedTemplate);
      
      // Find all versions of this template (same name pattern)
      const baseName = convertedTemplate.name.replace(/ v\d+\.\d+$/, '');
      const versions = formHierarchyData.templates
        .filter(t => t.name.startsWith(baseName) && t.typeId === convertedTemplate.typeId)
        .map(t => ({
          ...t,
          effectiveDate: new Date(t.effectiveDate),
          expirationDate: t.expirationDate ? new Date(t.expirationDate) : undefined
        } as FormTemplate));
      
      setAllVersions(versions);
    }
    
    setIsLoading(false);
  }, [templateId]);

  const handleEdit = (template: FormTemplate) => {
    router.push(`/surveys/form-builder/editor?templateId=${template.id}`);
  };

  const handleView = (template: FormTemplate) => {
    // TODO: Implement template preview
    console.log('View template:', template);
  };

  const handleCopy = (template: FormTemplate, newName: string) => {
    // TODO: Implement template copying
    console.log('Copy template:', template, 'New name:', newName);
    alert(`Template "${newName}" created successfully!`);
  };

  const handleToggleActive = (template: FormTemplate) => {
    // TODO: Implement template activation/deactivation
    console.log('Toggle active status for template:', template);
    alert(`Template ${template.isActive ? 'deactivated' : 'activated'} successfully!`);
  };

  const handleCreateVersion = (template: FormTemplate) => {
    // TODO: Implement version creation
    console.log('Create new version for template:', template);
    const newVersion = template.version + 1;
    alert(`New version v${newVersion} created successfully!`);
  };

  const handleCompareVersions = (template1: FormTemplate, template2: FormTemplate) => {
    // The comparison will be handled by the TemplateComparison component
    console.log('Compare versions:', template1.version, 'vs', template2.version);
  };

  const handleBack = () => {
    router.push('/surveys/form-builder');
  };

  if (isLoading) {
    return (
      <AppLayout headerTitle="Template Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading template...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!template) {
    return (
      <AppLayout headerTitle="Template Management">
        <div className="flex flex-col items-center justify-center h-64">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Template Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The requested template could not be found.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Form Builder
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout headerTitle="Template Management">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Form Builder
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">Template Management</h1>
                    <p className="text-muted-foreground text-lg">
                      Manage versions, settings, and lifecycle of your form template
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FormPreview 
                    questions={template.questions || []}
                    formTitle={template.name}
                    formDescription={template.description || undefined}
                  />
                  <Button variant="outline" onClick={() => handleEdit(template)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Template
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => handleEdit(template)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Edit Template</h3>
                        <p className="text-sm text-muted-foreground">Modify questions and settings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all hover:shadow-lg" onClick={() => handleCreateVersion(template)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                        <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">New Version</h3>
                        <p className="text-sm text-muted-foreground">Create v{template.version + 1}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                        <Copy className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Copy Template</h3>
                        <p className="text-sm text-muted-foreground">Duplicate for new use case</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer transition-all hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                        <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">Settings</h3>
                        <p className="text-sm text-muted-foreground">Configure template options</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Template Management Component */}
              <TemplateManagement
                template={template}
                versions={allVersions}
                onEdit={handleEdit}
                onView={handleView}
                onCopy={handleCopy}
                onToggleActive={handleToggleActive}
                onCreateVersion={handleCreateVersion}
                onCompareVersions={handleCompareVersions}
              />

              {/* Version Comparison */}
              {allVersions.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Version Comparison</CardTitle>
                    <CardDescription>
                      Compare different versions to see what has changed
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {allVersions
                        .filter(v => v.id !== template.id)
                        .sort((a, b) => b.version - a.version)
                        .slice(0, 3)
                        .map(version => (
                          <TemplateComparison
                            key={version.id}
                            template1={template}
                            template2={version}
                            trigger={
                              <Button variant="outline" size="sm">
                                Compare with v{version.version}
                              </Button>
                            }
                          />
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}