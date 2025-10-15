'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  GitBranch, 
  Plus, 
  Minus, 
  Edit, 
  FileText,
  Calendar
} from 'lucide-react';
import { FormTemplate, Question, QuestionType } from '@/types';

interface TemplateComparisonProps {
  template1: FormTemplate;
  template2: FormTemplate;
  trigger?: React.ReactNode;
}

interface ComparisonResult {
  added: Question[];
  removed: Question[];
  modified: Array<{
    question1: Question;
    question2: Question;
    changes: string[];
  }>;
  unchanged: Question[];
}

export function TemplateComparison({ 
  template1, 
  template2, 
  trigger 
}: TemplateComparisonProps) {
  const comparison = useMemo((): ComparisonResult => {
    const questions1 = template1.questions || [];
    const questions2 = template2.questions || [];
    
    const added: Question[] = [];
    const removed: Question[] = [];
    const modified: Array<{ question1: Question; question2: Question; changes: string[] }> = [];
    const unchanged: Question[] = [];

    // Find questions in template2 that are not in template1 (added)
    questions2.forEach(q2 => {
      const q1 = questions1.find(q => q.id === q2.id);
      if (!q1) {
        added.push(q2);
      }
    });

    // Find questions in template1 that are not in template2 (removed)
    questions1.forEach(q1 => {
      const q2 = questions2.find(q => q.id === q1.id);
      if (!q2) {
        removed.push(q1);
      }
    });

    // Find questions that exist in both but have changes (modified)
    questions1.forEach(q1 => {
      const q2 = questions2.find(q => q.id === q1.id);
      if (q2) {
        const changes: string[] = [];
        
        if (q1.text !== q2.text) {
          changes.push('Question text changed');
        }
        if (q1.required !== q2.required) {
          changes.push(`Required status changed (${q1.required ? 'required' : 'optional'} → ${q2.required ? 'required' : 'optional'})`);
        }
        if (q1.helpText !== q2.helpText) {
          changes.push('Help text changed');
        }
        if (q1.type !== q2.type) {
          changes.push(`Question type changed (${q1.type} → ${q2.type})`);
        }
        if (JSON.stringify(q1.options) !== JSON.stringify(q2.options)) {
          changes.push('Answer options changed');
        }

        if (changes.length > 0) {
          modified.push({ question1: q1, question2: q2, changes });
        } else {
          unchanged.push(q1);
        }
      }
    });

    return { added, removed, modified, unchanged };
  }, [template1, template2]);

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch (type) {
      case QuestionType.TEXT_INPUT:
        return 'Text Input';
      case QuestionType.SINGLE_SELECT:
        return 'Single Select';
      case QuestionType.YES_NO:
        return 'Yes/No';
      case QuestionType.SECTION_HEADER:
        return 'Section Header';
      default:
        return type.replace('_', ' ');
    }
  };

  const renderQuestion = (question: Question, variant: 'added' | 'removed' | 'unchanged' = 'unchanged') => {
    const bgColor = variant === 'added' ? 'bg-green-50 dark:bg-green-950' : 
                   variant === 'removed' ? 'bg-red-50 dark:bg-red-950' : 
                   'bg-background';
    
    const borderColor = variant === 'added' ? 'border-green-200 dark:border-green-800' : 
                       variant === 'removed' ? 'border-red-200 dark:border-red-800' : 
                       'border-border';

    return (
      <div key={question.id} className={`p-3 rounded-lg border ${bgColor} ${borderColor}`}>
        <div className="flex items-start gap-3">
          {variant === 'added' && <Plus className="h-4 w-4 text-green-600 mt-0.5" />}
          {variant === 'removed' && <Minus className="h-4 w-4 text-red-600 mt-0.5" />}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {getQuestionTypeLabel(question.type)}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
            <div className="font-medium text-sm">{question.text}</div>
            {question.helpText && (
              <div className="text-xs text-muted-foreground mt-1">{question.helpText}</div>
            )}
            {question.options && question.options.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Options: {question.options.map(o => o.label).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderModifiedQuestion = (item: { question1: Question; question2: Question; changes: string[] }) => {
    return (
      <div key={item.question1.id} className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Edit className="h-4 w-4 text-blue-600" />
          <span>Modified Question</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">Before (v{template1.version})</div>
            {renderQuestion(item.question1)}
          </div>
          
          {/* After */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">After (v{template2.version})</div>
            {renderQuestion(item.question2)}
          </div>
        </div>
        
        {/* Changes */}
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <div className="text-sm font-medium mb-2">Changes:</div>
          <ul className="text-sm text-muted-foreground space-y-1">
            {item.changes.map((change, index) => (
              <li key={index}>• {change}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const totalChanges = comparison.added.length + comparison.removed.length + comparison.modified.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Compare Versions
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Template Version Comparison
          </DialogTitle>
          <DialogDescription>
            Comparing changes between v{template1.version} and v{template2.version}
          </DialogDescription>
        </DialogHeader>

        {/* Comparison Header */}
        <div className="grid grid-cols-2 gap-4 py-4 border-b">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{template1.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">v{template1.version}</Badge>
                <span>•</span>
                <Calendar className="h-3 w-3" />
                {new Date(template1.effectiveDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground">
                {template1.questions?.length || 0} questions
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{template2.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">v{template2.version}</Badge>
                <span>•</span>
                <Calendar className="h-3 w-3" />
                {new Date(template2.effectiveDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground">
                {template2.questions?.length || 0} questions
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 py-4 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{comparison.added.length}</div>
            <div className="text-xs text-muted-foreground">Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{comparison.removed.length}</div>
            <div className="text-xs text-muted-foreground">Removed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{comparison.modified.length}</div>
            <div className="text-xs text-muted-foreground">Modified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-muted-foreground">{comparison.unchanged.length}</div>
            <div className="text-xs text-muted-foreground">Unchanged</div>
          </div>
        </div>

        {/* Changes Content */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {totalChanges === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Changes Found</h3>
              <p className="text-muted-foreground">
                These template versions are identical.
              </p>
            </div>
          ) : (
            <>
              {/* Added Questions */}
              {comparison.added.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Added Questions ({comparison.added.length})
                  </h3>
                  <div className="space-y-2">
                    {comparison.added.map(question => renderQuestion(question, 'added'))}
                  </div>
                </div>
              )}

              {/* Removed Questions */}
              {comparison.removed.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                    <Minus className="h-5 w-5" />
                    Removed Questions ({comparison.removed.length})
                  </h3>
                  <div className="space-y-2">
                    {comparison.removed.map(question => renderQuestion(question, 'removed'))}
                  </div>
                </div>
              )}

              {/* Modified Questions */}
              {comparison.modified.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
                    <Edit className="h-5 w-5" />
                    Modified Questions ({comparison.modified.length})
                  </h3>
                  <div className="space-y-4">
                    {comparison.modified.map(renderModifiedQuestion)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}