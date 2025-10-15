'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FolderOpen, 
  FileText, 
  Plus, 
  ArrowLeft,
  Settings,
  Copy,
  Edit,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { useFormHierarchy } from '@/hooks/use-form-hierarchy';
import { FormCategory, FormType, FormTemplate } from '@/types';

interface FormHierarchyNavigationProps {
  onTemplateSelect?: (template: FormTemplate) => void;
  onCreateTemplate?: (typeId: string) => void;
}

export function FormHierarchyNavigation({ 
  onTemplateSelect, 
  onCreateTemplate 
}: FormHierarchyNavigationProps) {
  const {
    categories,
    selectedCategory,
    selectedType,
    selectedTemplate,
    breadcrumbs,
    selectCategory,
    selectType,
    selectTemplate,
    getTypesByCategory,
    getTemplatesByType,
    resetSelection
  } = useFormHierarchy();

  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  const handleTemplateCreate = () => {
    if (selectedType && newTemplateName.trim()) {
      // Navigate to form builder editor for new template
      window.location.href = `/surveys/form-builder/editor?typeId=${selectedType.id}&name=${encodeURIComponent(newTemplateName)}&description=${encodeURIComponent(newTemplateDescription)}`;
      setIsCreateTemplateOpen(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
    }
  };

  const handleTemplateSelect = (template: FormTemplate) => {
    selectTemplate(template);
    onTemplateSelect?.(template);
  };

  const handleTemplateEdit = (template: FormTemplate) => {
    // Navigate to form builder editor
    window.location.href = `/surveys/form-builder/editor?templateId=${template.id}`;
  };

  const renderBreadcrumbs = () => {
    if (breadcrumbs.length === 0) return null;

    return (
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/surveys" 
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  resetSelection();
                }}
              >
                Form Builder
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((item, index) => (
              <div key={item.id} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        if (item.type === 'category') {
                          const category = categories.find(c => c.id === item.id);
                          if (category) selectCategory(category);
                        } else if (item.type === 'type') {
                          const type = getTypesByCategory(selectedCategory?.id || '').find(t => t.id === item.id);
                          if (type) selectType(type);
                        }
                      }}
                    >
                      {item.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    );
  };

  const renderCategories = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Form Categories</h2>
          <p className="text-muted-foreground">
            Select a category to view form types and templates
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => selectCategory(category)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {getTypesByCategory(category.id).length} types
                </Badge>
                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTypes = () => {
    if (!selectedCategory) return null;

    const categoryTypes = getTypesByCategory(selectedCategory.id);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => selectCategory(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">{selectedCategory.name} Types</h2>
          <p className="text-muted-foreground">
            Select a form type to view available templates
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryTypes.map((type) => (
            <Card 
              key={type.id} 
              className="cursor-pointer transition-all hover:shadow-lg"
              onClick={() => selectType(type)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{type.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {getTemplatesByType(type.id).length} templates
                  </Badge>
                  <Badge variant={type.isActive ? 'default' : 'secondary'}>
                    {type.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTemplates = () => {
    if (!selectedType) return null;

    const typeTemplates = getTemplatesByType(selectedType.id);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => selectType(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Types
            </Button>
          </div>
          <Dialog open={isCreateTemplateOpen} onOpenChange={setIsCreateTemplateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a new form template for {selectedType.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Enter template description..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateTemplateOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleTemplateCreate}>
                  Create Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h2 className="text-2xl font-bold">{selectedType.name} Templates</h2>
          <p className="text-muted-foreground">
            Select a template to edit or create a new one
          </p>
        </div>
        
        <div className="space-y-3">
          {typeTemplates.map((template) => (
            <Card key={template.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">v{template.version}</Badge>
                        <Badge variant={template.isActive ? 'default' : 'secondary'}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {template.questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.location.href = `/surveys/form-builder/templates/${template.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleTemplateEdit(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {typeTemplates.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first template for {selectedType.name} to get started.
                </p>
                <Button onClick={() => setIsCreateTemplateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Template
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderBreadcrumbs()}
      
      {!selectedCategory && renderCategories()}
      {selectedCategory && !selectedType && renderTypes()}
      {selectedType && renderTemplates()}
    </div>
  );
}