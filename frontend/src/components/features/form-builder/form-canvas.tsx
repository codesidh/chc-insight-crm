'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Eye, 
  Settings,
  FileText,
  Trash2
} from 'lucide-react';
import { Question, QuestionType } from '@/types';
import { QuestionTypeDefinition } from './question-type-library';
import { SortableQuestionItem } from './sortable-question-item';

interface FormCanvasProps {
  questions: Question[];
  selectedQuestionId?: string;
  onQuestionsChange?: (questions: Question[]) => void;
  onQuestionSelect?: (question: Question) => void;
  onQuestionAdd?: (questionType: QuestionTypeDefinition) => void;
  onPreview?: () => void;
}

export function FormCanvas({
  questions,
  selectedQuestionId,
  onQuestionsChange,
  onQuestionSelect,
  onQuestionAdd,
  onPreview
}: FormCanvasProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
        onQuestionsChange?.(reorderedQuestions);
      }
    }

    setActiveId(null);
  }, [questions, onQuestionsChange]);

  const handleQuestionClick = (question: Question) => {
    onQuestionSelect?.(question);
  };

  const handleQuestionDelete = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onQuestionsChange?.(updatedQuestions);
  };

  const activeQuestion = activeId ? questions.find(q => q.id === activeId) : null;

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

  return (
    <div className="space-y-6">
      {/* Canvas Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Form Canvas</h3>
          <p className="text-sm text-muted-foreground">
            {questions.length} questions • Drag to reorder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Badge variant="secondary">
            {questions.filter(q => q.required).length} required
          </Badge>
        </div>
      </div>

      {/* Form Canvas */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6">
          {questions.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Start Building Your Form</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Add questions from the question type library on the left to start building your form.
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Click on question types to add them</p>
                <p>• Drag questions to reorder them</p>
                <p>• Click on questions to configure properties</p>
              </div>
            </div>
          ) : (
            // Questions List with Drag and Drop
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      isSelected={selectedQuestionId === question.id}
                      onClick={() => handleQuestionClick(question)}
                      onDelete={() => handleQuestionDelete(question.id)}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeQuestion ? (
                  <Card className="shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {activeQuestion.text || 'Untitled Question'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {getQuestionTypeLabel(activeQuestion.type)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Canvas Footer */}
      {questions.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Form Statistics
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{questions.length} total questions</span>
                <span>{questions.filter(q => q.required).length} required</span>
                <span>
                  {questions.filter(q => q.type === QuestionType.SECTION_HEADER).length} sections
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}