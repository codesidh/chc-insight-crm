'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  ArrowLeft,
  FileText
} from 'lucide-react';
import { Question, QuestionType, FormTemplate } from '@/types';
import { QuestionTypeLibrary, QuestionTypeDefinition } from './question-type-library';
import { FormCanvas } from './form-canvas';
import { QuestionConfigurationPanel } from './question-configuration-panel';
import { FormPreview } from './form-preview';

interface FormBuilderInterfaceProps {
  template?: FormTemplate | undefined;
  onSave?: (template: Partial<FormTemplate>) => void;
  onBack?: () => void;
}

export function FormBuilderInterface({ 
  template, 
  onSave, 
  onBack 
}: FormBuilderInterfaceProps) {
  const [formName, setFormName] = useState(template?.name || '');
  const [formDescription, setFormDescription] = useState(template?.description || '');
  const [questions, setQuestions] = useState<Question[]>(template?.questions || []);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const generateQuestionId = () => `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleQuestionTypeSelect = useCallback((questionType: QuestionTypeDefinition) => {
    const newQuestion: Question = {
      id: generateQuestionId(),
      type: questionType.type,
      text: getDefaultQuestionText(questionType.type),
      required: false,
      validation: []
    };

    if (questionType.type === QuestionType.SINGLE_SELECT) {
      newQuestion.options = [
        { id: 'option-1', label: 'Option 1', value: 'option_1' },
        { id: 'option-2', label: 'Option 2', value: 'option_2' }
      ];
    }

    setQuestions(prev => [...prev, newQuestion]);
    setSelectedQuestion(newQuestion);
    setHasUnsavedChanges(true);
  }, []);

  const handleQuestionsChange = useCallback((updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
    setHasUnsavedChanges(true);
  }, []);

  const handleQuestionSelect = useCallback((question: Question) => {
    setSelectedQuestion(question);
  }, []);

  const handleQuestionUpdate = useCallback((updatedQuestion: Question) => {
    setQuestions(prev => 
      prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q)
    );
    setSelectedQuestion(updatedQuestion);
    setHasUnsavedChanges(true);
  }, []);

  const handleQuestionDelete = useCallback((questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    if (selectedQuestion?.id === questionId) {
      setSelectedQuestion(null);
    }
    setHasUnsavedChanges(true);
  }, [selectedQuestion]);

  const handleSave = () => {
    const templateData: Partial<FormTemplate> = {
      name: formName,
      description: formDescription,
      questions,
      version: template?.version || 1,
      isActive: template?.isActive ?? true
    };

    onSave?.(templateData);
    setHasUnsavedChanges(false);
  };

  const getDefaultQuestionText = (type: QuestionType): string => {
    switch (type) {
      case QuestionType.TEXT_INPUT:
        return 'Enter your text response';
      case QuestionType.SINGLE_SELECT:
        return 'Select one option';
      case QuestionType.YES_NO:
        return 'Please select yes or no';
      case QuestionType.SECTION_HEADER:
        return 'Section Title';
      default:
        return 'New Question';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <div>
                <h1 className="text-lg font-semibold">
                  {template ? 'Edit Template' : 'New Template'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {questions.length} questions
                </p>
              </div>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary">Unsaved Changes</Badge>
            )}
            <FormPreview 
              questions={questions}
              formTitle={formName || 'Untitled Form'}
              formDescription={formDescription}
            />
            <Button onClick={handleSave} disabled={!formName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Question Types */}
        <div className="w-80 border-r bg-muted/30 overflow-y-auto">
          <div className="p-6">
            <QuestionTypeLibrary onQuestionTypeSelect={handleQuestionTypeSelect} />
          </div>
        </div>

        {/* Center - Form Canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Form Metadata */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Form Information</CardTitle>
                <CardDescription>
                  Configure the basic information for your form template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-name">Template Name</Label>
                  <Input
                    id="form-name"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <Label htmlFor="form-description">Description</Label>
                  <Textarea
                    id="form-description"
                    value={formDescription}
                    onChange={(e) => {
                      setFormDescription(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Enter template description..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Canvas */}
            <FormCanvas
              questions={questions}
              selectedQuestionId={selectedQuestion?.id || undefined}
              onQuestionsChange={handleQuestionsChange}
              onQuestionSelect={handleQuestionSelect}
              onQuestionAdd={handleQuestionTypeSelect}
            />
          </div>
        </div>

        {/* Right Sidebar - Question Configuration */}
        <div className="w-96 border-l bg-muted/30 overflow-y-auto">
          <div className="p-6">
            <QuestionConfigurationPanel
              question={selectedQuestion}
              onQuestionUpdate={handleQuestionUpdate}
              onQuestionDelete={handleQuestionDelete}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-12 items-center justify-between px-6">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{questions.length} questions</span>
            <span>{questions.filter(q => q.required).length} required</span>
            <span>
              {questions.filter(q => q.type === QuestionType.SECTION_HEADER).length} sections
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Auto-saved</span>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}