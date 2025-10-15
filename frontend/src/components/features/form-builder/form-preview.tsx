'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Eye, 
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Question, QuestionType } from '@/types';

interface FormPreviewProps {
  questions: Question[];
  formTitle?: string;
  formDescription?: string | undefined;
}

export function FormPreview({ 
  questions, 
  formTitle = "Form Preview",
  formDescription = "This is how your form will appear to users"
}: FormPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: Question) => {
    const response = responses[question.id];

    switch (question.type) {
      case QuestionType.TEXT_INPUT:
        return (
          <div key={question.id} className="space-y-2">
            <Label htmlFor={question.id} className="text-sm font-medium">
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-xs text-muted-foreground">{question.helpText}</p>
            )}
            <Input
              id={question.id}
              value={response || question.defaultValue || ''}
              onChange={(e) => handleResponseChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
            />
          </div>
        );

      case QuestionType.SINGLE_SELECT:
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-xs text-muted-foreground">{question.helpText}</p>
            )}
            <Select
              value={response || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {question.options?.map((option) => (
                  <SelectItem key={option.id} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case QuestionType.YES_NO:
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-xs text-muted-foreground">{question.helpText}</p>
            )}
            <RadioGroup
              value={response || ''}
              onValueChange={(value) => handleResponseChange(question.id, value)}
              className="flex items-center gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                <Label htmlFor={`${question.id}-yes`}>Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id={`${question.id}-no`} />
                <Label htmlFor={`${question.id}-no`}>No</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case QuestionType.SECTION_HEADER:
        return (
          <div key={question.id} className="space-y-2 pt-6 first:pt-0">
            <h3 className="text-lg font-semibold border-b pb-2">
              {question.text}
            </h3>
            {question.helpText && (
              <p className="text-sm text-muted-foreground">{question.helpText}</p>
            )}
          </div>
        );

      default:
        return (
          <div key={question.id} className="space-y-2">
            <Label className="text-sm font-medium">
              {question.text}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {question.helpText && (
              <p className="text-xs text-muted-foreground">{question.helpText}</p>
            )}
            <div className="p-3 bg-muted rounded border-2 border-dashed">
              <p className="text-sm text-muted-foreground">
                {question.type.replace('_', ' ')} field (not implemented in preview)
              </p>
            </div>
          </div>
        );
    }
  };

  const getCompletionStats = () => {
    const totalQuestions = questions.filter(q => q.type !== QuestionType.SECTION_HEADER).length;
    const requiredQuestions = questions.filter(q => q.required && q.type !== QuestionType.SECTION_HEADER).length;
    const answeredQuestions = Object.keys(responses).filter(id => {
      const question = questions.find(q => q.id === id);
      return question && question.type !== QuestionType.SECTION_HEADER && responses[id];
    }).length;
    const answeredRequired = questions.filter(q => 
      q.required && q.type !== QuestionType.SECTION_HEADER && responses[q.id]
    ).length;

    return {
      totalQuestions,
      requiredQuestions,
      answeredQuestions,
      answeredRequired,
      completionPercentage: totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0,
      requiredCompletionPercentage: requiredQuestions > 0 ? Math.round((answeredRequired / requiredQuestions) * 100) : 100
    };
  };

  const stats = getCompletionStats();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Preview Form
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {formTitle}
          </DialogTitle>
          <DialogDescription>
            {formDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
            <div className="text-xs text-muted-foreground">Overall Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.answeredQuestions}/{stats.totalQuestions}</div>
            <div className="text-xs text-muted-foreground">Questions Answered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.answeredRequired}/{stats.requiredQuestions}</div>
            <div className="text-xs text-muted-foreground">Required Complete</div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Questions to Preview</h3>
              <p className="text-muted-foreground">
                Add some questions to your form to see the preview.
              </p>
            </div>
          ) : (
            <div className="space-y-6 p-1">
              {questions.map((question) => renderQuestion(question))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        {questions.length > 0 && (
          <div className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated completion: 3-5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                Save Draft
              </Button>
              <Button 
                disabled={stats.requiredCompletionPercentage < 100}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Submit Form
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}