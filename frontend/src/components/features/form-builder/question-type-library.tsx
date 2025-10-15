'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Hash, 
  Calendar, 
  ChevronDown, 
  ToggleLeft,
  FileText,
  Heading1
} from 'lucide-react';
import { QuestionType } from '@/types';

export interface QuestionTypeDefinition {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'input' | 'selection' | 'media' | 'layout';
  isAvailable: boolean; // For MVP, only some types are available
}

// MVP Question Types (text, select, yes/no only)
export const QUESTION_TYPES: QuestionTypeDefinition[] = [
  {
    type: QuestionType.TEXT_INPUT,
    label: 'Text Input',
    description: 'Single line text input field',
    icon: Type,
    category: 'input',
    isAvailable: true
  },
  {
    type: QuestionType.SINGLE_SELECT,
    label: 'Single Select',
    description: 'Dropdown or radio button selection',
    icon: ChevronDown,
    category: 'selection',
    isAvailable: true
  },
  {
    type: QuestionType.YES_NO,
    label: 'Yes/No',
    description: 'Boolean toggle or radio buttons',
    icon: ToggleLeft,
    category: 'selection',
    isAvailable: true
  },
  {
    type: QuestionType.SECTION_HEADER,
    label: 'Section Header',
    description: 'Organize form sections with headers',
    icon: Heading1,
    category: 'layout',
    isAvailable: true
  },
  // Future question types (disabled for MVP)
  {
    type: QuestionType.NUMERIC_INPUT,
    label: 'Numeric Input',
    description: 'Number input with validation',
    icon: Hash,
    category: 'input',
    isAvailable: false
  },
  {
    type: QuestionType.DATE,
    label: 'Date Picker',
    description: 'Date selection input',
    icon: Calendar,
    category: 'input',
    isAvailable: false
  },
  {
    type: QuestionType.MULTI_SELECT,
    label: 'Multi Select',
    description: 'Multiple choice checkboxes',
    icon: ChevronDown,
    category: 'selection',
    isAvailable: false
  },
  {
    type: QuestionType.FILE_UPLOAD,
    label: 'File Upload',
    description: 'File attachment input',
    icon: FileText,
    category: 'media',
    isAvailable: false
  }
];

interface QuestionTypeLibraryProps {
  onQuestionTypeSelect?: (questionType: QuestionTypeDefinition) => void;
}

export function QuestionTypeLibrary({ onQuestionTypeSelect }: QuestionTypeLibraryProps) {
  const availableTypes = QUESTION_TYPES.filter(type => type.isAvailable);
  const futureTypes = QUESTION_TYPES.filter(type => !type.isAvailable);

  const handleTypeClick = (questionType: QuestionTypeDefinition) => {
    if (questionType.isAvailable) {
      onQuestionTypeSelect?.(questionType);
    }
  };

  const renderQuestionType = (questionType: QuestionTypeDefinition) => {
    const Icon = questionType.icon;
    
    return (
      <Card 
        key={questionType.type}
        className={`cursor-pointer transition-all hover:shadow-md ${
          questionType.isAvailable 
            ? 'hover:border-primary' 
            : 'opacity-50 cursor-not-allowed'
        }`}
        onClick={() => handleTypeClick(questionType)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              questionType.isAvailable 
                ? 'bg-primary/10 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{questionType.label}</h4>
                {!questionType.isAvailable && (
                  <Badge variant="secondary" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {questionType.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Question Types</h3>
        <p className="text-sm text-muted-foreground">
          Drag question types to the form canvas to build your form
        </p>
      </div>

      {/* Available Question Types */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium">Available (MVP)</h4>
          <Badge variant="default" className="text-xs">
            {availableTypes.length} types
          </Badge>
        </div>
        <div className="space-y-2">
          {availableTypes.map(renderQuestionType)}
        </div>
      </div>

      {/* Future Question Types */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-muted-foreground">Coming Soon</h4>
          <Badge variant="secondary" className="text-xs">
            {futureTypes.length} types
          </Badge>
        </div>
        <div className="space-y-2">
          {futureTypes.map(renderQuestionType)}
        </div>
      </div>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground space-y-2">
            <p className="font-medium">How to use:</p>
            <ul className="space-y-1 ml-4">
              <li>• Click on a question type to add it to your form</li>
              <li>• Drag questions in the canvas to reorder them</li>
              <li>• Click on questions to configure their properties</li>
              <li>• Use section headers to organize your form</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}