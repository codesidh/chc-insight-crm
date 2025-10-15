import { useState, useMemo } from 'react';
import { FormCategory, FormType, FormTemplate, BreadcrumbItem } from '@/types';
import formHierarchyData from '@/data/app/form_hierarchy_data.json';

export interface UseFormHierarchyReturn {
  categories: FormCategory[];
  types: FormType[];
  templates: FormTemplate[];
  selectedCategory: FormCategory | null;
  selectedType: FormType | null;
  selectedTemplate: FormTemplate | null;
  breadcrumbs: BreadcrumbItem[];
  selectCategory: (category: FormCategory | null) => void;
  selectType: (type: FormType | null) => void;
  selectTemplate: (template: FormTemplate | null) => void;
  getTypesByCategory: (categoryId: string) => FormType[];
  getTemplatesByType: (typeId: string) => FormTemplate[];
  resetSelection: () => void;
}

export function useFormHierarchy(): UseFormHierarchyReturn {
  const [selectedCategory, setSelectedCategory] = useState<FormCategory | null>(null);
  const [selectedType, setSelectedType] = useState<FormType | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const categories = useMemo(() => 
    formHierarchyData.categories.map(c => ({
      ...c,
      createdAt: new Date(c.createdAt)
    })) as FormCategory[], []);
    
  const types = useMemo(() => 
    formHierarchyData.types.map(t => ({
      ...t,
      createdAt: new Date(t.createdAt)
    })) as FormType[], []);
    
  const templates = useMemo(() => 
    formHierarchyData.templates.map(t => ({
      ...t,
      effectiveDate: new Date(t.effectiveDate),
      expirationDate: t.expirationDate ? new Date(t.expirationDate) : undefined
    })) as FormTemplate[], []);

  const getTypesByCategory = (categoryId: string): FormType[] => {
    return types.filter(type => type.categoryId === categoryId && type.isActive);
  };

  const getTemplatesByType = (typeId: string): FormTemplate[] => {
    return templates.filter(template => template.typeId === typeId && template.isActive);
  };

  const selectCategory = (category: FormCategory | null) => {
    setSelectedCategory(category);
    setSelectedType(null);
    setSelectedTemplate(null);
  };

  const selectType = (type: FormType | null) => {
    setSelectedType(type);
    setSelectedTemplate(null);
  };

  const selectTemplate = (template: FormTemplate | null) => {
    setSelectedTemplate(template);
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setSelectedTemplate(null);
  };

  const breadcrumbs = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    if (selectedCategory) {
      items.push({
        id: selectedCategory.id,
        name: selectedCategory.name,
        type: 'category',
        href: `/surveys/categories/${selectedCategory.id}`
      });
    }

    if (selectedType) {
      items.push({
        id: selectedType.id,
        name: selectedType.name,
        type: 'type',
        href: `/surveys/categories/${selectedCategory?.id}/types/${selectedType.id}`
      });
    }

    if (selectedTemplate) {
      items.push({
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        type: 'template',
        href: `/surveys/categories/${selectedCategory?.id}/types/${selectedType?.id}/templates/${selectedTemplate.id}`
      });
    }

    return items;
  }, [selectedCategory, selectedType, selectedTemplate]);

  return {
    categories,
    types,
    templates,
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
  };
}