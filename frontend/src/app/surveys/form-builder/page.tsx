'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FormHierarchyNavigation } from '@/components/features/form-builder/form-hierarchy-navigation';
import { TemplateListingTable } from '@/components/features/form-builder/template-listing-table';
import { useFormHierarchy } from '@/hooks/use-form-hierarchy';
import { FormTemplate } from '@/types';
import { 
  Settings, 
  FileText, 
  Plus,
  Layout,
  List
} from 'lucide-react';

export default function FormBuilderPage() {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  
  const {
    templates,
    selectedType,
    getTemplatesByType
  } = useFormHierarchy();

  const handleTemplateSelect = (template: FormTemplate) => {
    setSelectedTemplate(template);
    // TODO: Navigate to form builder interface
    console.log('Selected template:', template);
  };

  const handleCreateTemplate = (typeId: string) => {
    // Navigate to form builder editor for new template
    window.location.href = `/surveys/form-builder/editor?typeId=${typeId}`;
  };

  const handleEditTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    // Navigate to form builder editor
    window.location.href = `/surveys/form-builder/editor?templateId=${template.id}`;
  };

  const handleViewTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
    // TODO: Navigate to template preview
    console.log('View template:', template);
  };

  const handleCopyTemplate = (template: FormTemplate) => {
    // TODO: Implement template copying
    console.log('Copy template:', template);
  };

  const handleDeleteTemplate = (template: FormTemplate) => {
    // TODO: Implement template deletion
    console.log('Delete template:', template);
  };

  const currentTemplates = selectedType ? getTemplatesByType(selectedType.id) : templates;

  return (
    <AppLayout headerTitle="Form Builder">
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-8 py-6 md:py-8">
            <div className="px-4 lg:px-6 space-y-8">
              
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">Form Builder</h1>
                  <p className="text-muted-foreground text-lg">
                    Create and manage dynamic forms with hierarchical organization
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Template
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{templates.length}</div>
                    <p className="text-xs text-muted-foreground">
                      Across all categories
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {templates.filter(t => t.isActive).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently deployed
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Form Categories</CardTitle>
                    <Layout className="h-4 w-4 text-muted-foreground" />
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
                    <List className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">
                      Available form types
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Management</CardTitle>
                  <CardDescription>
                    Navigate through the form hierarchy or view all templates in a table
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="hierarchy" className="gap-2">
                        <Layout className="h-4 w-4" />
                        Hierarchy View
                      </TabsTrigger>
                      <TabsTrigger value="table" className="gap-2">
                        <List className="h-4 w-4" />
                        Table View
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="hierarchy" className="mt-6">
                      <FormHierarchyNavigation
                        onTemplateSelect={handleTemplateSelect}
                        onCreateTemplate={handleCreateTemplate}
                      />
                    </TabsContent>
                    
                    <TabsContent value="table" className="mt-6">
                      <TemplateListingTable
                        templates={currentTemplates}
                        onEdit={handleEditTemplate}
                        onView={handleViewTemplate}
                        onCopy={handleCopyTemplate}
                        onDelete={handleDeleteTemplate}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Selected Template Info */}
              {selectedTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Template</CardTitle>
                    <CardDescription>
                      {selectedTemplate.name} - Version {selectedTemplate.version}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <Button onClick={() => handleEditTemplate(selectedTemplate)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Edit Template
                        </Button>
                        <Button variant="outline" onClick={() => handleViewTemplate(selectedTemplate)}>
                          Preview Template
                        </Button>
                        <Button variant="outline" onClick={() => handleCopyTemplate(selectedTemplate)}>
                          Copy Template
                        </Button>
                      </div>
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