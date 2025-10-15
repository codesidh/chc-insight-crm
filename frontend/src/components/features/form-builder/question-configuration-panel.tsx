'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Settings, 
  Plus, 
  Trash2, 
  GripVertical,
  Save
} from 'lucide-react';
import { Question, QuestionType, QuestionOption } from '@/types';

// Validation schema for question configuration
const questionConfigSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  required: z.boolean().default(false),
  helpText: z.string().optional(),
  defaultValue: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Option label is required'),
    value: z.string().min(1, 'Option value is required')
  })).optional()
});

type QuestionConfigFormData = z.infer<typeof questionConfigSchema>;

interface QuestionConfigurationPanelProps {
  question: Question | null;
  onQuestionUpdate?: (question: Question) => void;
  onQuestionDelete?: (questionId: string) => void;
}

export function QuestionConfigurationPanel({ 
  question, 
  onQuestionUpdate,
  onQuestionDelete 
}: QuestionConfigurationPanelProps) {
  const [options, setOptions] = useState<QuestionOption[]>([]);

  const form = useForm<QuestionConfigFormData>({
    resolver: zodResolver(questionConfigSchema),
    defaultValues: {
      text: '',
      required: false,
      helpText: '',
      defaultValue: '',
      options: []
    }
  });

  // Update form when question changes
  useEffect(() => {
    if (question) {
      form.reset({
        text: question.text,
        required: question.required,
        helpText: question.helpText || '',
        defaultValue: question.defaultValue || '',
        options: question.options || []
      });
      setOptions(question.options || []);
    }
  }, [question, form]);

  const handleSave = (data: QuestionConfigFormData) => {
    if (!question) return;

    const updatedQuestion: Question = {
      ...question,
      text: data.text,
      required: data.required,
      helpText: data.helpText,
      defaultValue: data.defaultValue,
      options: needsOptions(question.type) ? options : undefined
    };

    onQuestionUpdate?.(updatedQuestion);
  };

  const handleDelete = () => {
    if (question) {
      onQuestionDelete?.(question.id);
    }
  };

  const needsOptions = (type: QuestionType): boolean => {
    return type === QuestionType.SINGLE_SELECT || type === QuestionType.MULTI_SELECT;
  };

  const addOption = () => {
    const newOption: QuestionOption = {
      id: `option-${Date.now()}`,
      label: `Option ${options.length + 1}`,
      value: `option_${options.length + 1}`
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (index: number, field: 'label' | 'value', value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setOptions(updatedOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  if (!question) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Question Selected</h3>
          <p className="text-muted-foreground text-center">
            Select a question from the form canvas to configure its properties.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Question Configuration</CardTitle>
            <CardDescription>
              Configure properties for the selected question
            </CardDescription>
          </div>
          <Badge variant="outline">
            {question.type.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            
            {/* Question Text */}
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The main question text that users will see
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Help Text */}
            <FormField
              control={form.control}
              name="helpText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Help Text (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Additional guidance for users..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional help text to guide users
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Required Toggle */}
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Required Question</FormLabel>
                    <FormDescription>
                      Users must answer this question to proceed
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Default Value (for text inputs) */}
            {question.type === QuestionType.TEXT_INPUT && (
              <FormField
                control={form.control}
                name="defaultValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Value (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Default text value..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Pre-filled value for the text input
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Options Configuration (for select questions) */}
            {needsOptions(question.type) && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Answer Options</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={option.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Option label"
                          value={option.label}
                          onChange={(e) => updateOption(index, 'label', e.target.value)}
                        />
                        <Input
                          placeholder="Option value"
                          value={option.value}
                          onChange={(e) => updateOption(index, 'value', e.target.value)}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  {options.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No options added yet.</p>
                      <p className="text-sm">Click "Add Option" to create answer choices.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Question
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}