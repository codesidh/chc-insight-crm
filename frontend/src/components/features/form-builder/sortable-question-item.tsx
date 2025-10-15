'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  GripVertical, 
  Settings, 
  Trash2,
  Type,
  ChevronDown,
  ToggleLeft,
  Heading1,
  Hash,
  Calendar,
  FileText
} from 'lucide-react';
import { Question, QuestionType } from '@/types';

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function SortableQuestionItem({
  question,
  index,
  isSelected,
  onClick,
  onDelete
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getQuestionIcon = (type: QuestionType) => {
    switch (type) {
      case QuestionType.TEXT_INPUT:
        return Type;
      case QuestionType.SINGLE_SELECT:
        return ChevronDown;
      case QuestionType.YES_NO:
        return ToggleLeft;
      case QuestionType.SECTION_HEADER:
        return Heading1;
      case QuestionType.NUMERIC_INPUT:
        return Hash;
      case QuestionType.DATE:
        return Calendar;
      case QuestionType.FILE_UPLOAD:
        return FileText;
      default:
        return Settings;
    }
  };

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
      case QuestionType.NUMERIC_INPUT:
        return 'Number';
      case QuestionType.DATE:
        return 'Date';
      case QuestionType.FILE_UPLOAD:
        return 'File Upload';
      default:
        return type.replace('_', ' ');
    }
  };

  const renderQuestionPreview = () => {
    switch (question.type) {
      case QuestionType.TEXT_INPUT:
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">{question.text || 'Untitled Question'}</div>
            {question.helpText && (
              <div className="text-xs text-muted-foreground">{question.helpText}</div>
            )}
            <div className="w-full h-8 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center px-2">
              <span className="text-xs text-muted-foreground">Text input field</span>
            </div>
          </div>
        );

      case QuestionType.SINGLE_SELECT:
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">{question.text || 'Untitled Question'}</div>
            {question.helpText && (
              <div className="text-xs text-muted-foreground">{question.helpText}</div>
            )}
            <div className="w-full h-8 bg-muted rounded border-2 border-dashed border-muted-foreground/20 flex items-center justify-between px-2">
              <span className="text-xs text-muted-foreground">
                {question.options?.length ? `${question.options.length} options` : 'No options'}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        );

      case QuestionType.YES_NO:
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">{question.text || 'Untitled Question'}</div>
            {question.helpText && (
              <div className="text-xs text-muted-foreground">{question.helpText}</div>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/40"></div>
                <span className="text-xs text-muted-foreground">Yes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/40"></div>
                <span className="text-xs text-muted-foreground">No</span>
              </div>
            </div>
          </div>
        );

      case QuestionType.SECTION_HEADER:
        return (
          <div className="space-y-2">
            <div className="text-base font-semibold border-b pb-1">
              {question.text || 'Section Header'}
            </div>
            {question.helpText && (
              <div className="text-xs text-muted-foreground">{question.helpText}</div>
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium">{question.text || 'Untitled Question'}</div>
            {question.helpText && (
              <div className="text-xs text-muted-foreground">{question.helpText}</div>
            )}
            <div className="text-xs text-muted-foreground">
              {getQuestionTypeLabel(question.type)} field
            </div>
          </div>
        );
    }
  };

  const Icon = getQuestionIcon(question.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <Card 
        className={`transition-all cursor-pointer hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary border-primary' : ''
        }`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-6 h-6 cursor-grab hover:bg-muted rounded mt-1"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Question Number */}
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium mt-1">
              {index + 1}
            </div>

            {/* Question Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded bg-muted mt-1">
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Question Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {getQuestionTypeLabel(question.type)}
                </Badge>
                {question.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              {renderQuestionPreview()}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}