'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormBuilderInterface } from '@/components/features/form-builder/form-builder-interface';
import { FormTemplate } from '@/types';
import formHierarchyData from '@/data/app/form_hierarchy_data.json';

export default function FormBuilderEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const typeId = searchParams.get('typeId');
  
  const [template, setTemplate] = useState<FormTemplate | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load template if editing existing one
    if (templateId) {
      const existingTemplate = formHierarchyData.templates.find(
        t => t.id === templateId
      ) as FormTemplate;
      
      if (existingTemplate) {
        setTemplate(existingTemplate);
      }
    }
    setIsLoading(false);
  }, [templateId]);

  const handleSave = (templateData: Partial<FormTemplate>) => {
    // TODO: Implement actual save functionality
    console.log('Saving template:', templateData);
    
    // For now, just show success and navigate back
    alert('Template saved successfully!');
    router.push('/surveys/form-builder');
  };

  const handleBack = () => {
    router.push('/surveys/form-builder');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading form builder...</p>
        </div>
      </div>
    );
  }

  return (
    <FormBuilderInterface
      template={template}
      onSave={handleSave}
      onBack={handleBack}
    />
  );
}