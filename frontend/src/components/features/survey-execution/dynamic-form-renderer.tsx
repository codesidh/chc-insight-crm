'use client'

import React, { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  CalendarIcon, 
  Upload, 
  X, 
  FileText, 
  Image as ImageIcon,
  AlertCircle,
  HelpCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

import { FormTemplate, Question, QuestionType, ConditionalRule } from '@/types'

interface DynamicFormRendererProps {
  template: FormTemplate
  form: UseFormReturn<any>
  readonly?: boolean
  instanceId: string
}

interface ConditionalLogicEngine {
  evaluateConditions: (responses: Record<string, any>, rules: ConditionalRule[]) => boolean
  getVisibleQuestions: (template: FormTemplate, responses: Record<string, any>) => Question[]
}

// Conditional logic engine
const conditionalLogicEngine: ConditionalLogicEngine = {
  evaluateConditions: (responses, rules) => {
    return rules.every(rule => {
      const targetValue = responses[rule.targetQuestionId]
      
      switch (rule.condition) {
        case 'equals':
          return targetValue === rule.value
        case 'not_equals':
          return targetValue !== rule.value
        case 'contains':
          return Array.isArray(targetValue) && targetValue.includes(rule.value)
        case 'not_contains':
          return Array.isArray(targetValue) && !targetValue.includes(rule.value)
        case 'greater_than':
          return Number(targetValue) > Number(rule.value)
        case 'less_than':
          return Number(targetValue) < Number(rule.value)
        case 'is_empty':
          return !targetValue || targetValue === '' || (Array.isArray(targetValue) && targetValue.length === 0)
        case 'is_not_empty':
          return targetValue && targetValue !== '' && (!Array.isArray(targetValue) || targetValue.length > 0)
        default:
          return true
      }
    })
  },
  
  getVisibleQuestions: (template, responses) => {
    return template.questions.filter(question => {
      if (!question.conditionalLogic || question.conditionalLogic.length === 0) {
        return true
      }
      
      return conditionalLogicEngine.evaluateConditions(responses, question.conditionalLogic)
    })
  }
}

// Individual question renderers
const QuestionRenderers = {
  [QuestionType.TEXT_INPUT]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {question.text}
            {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            {question.helpText && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <HelpCircle className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">{question.helpText}</p>
                </PopoverContent>
              </Popover>
            )}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              disabled={readonly}
              placeholder={question.helpText}
              className={cn(
                form.formState.errors[question.id] && "border-destructive focus:border-destructive"
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  [QuestionType.NUMERIC_INPUT]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {question.text}
            {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="number"
              disabled={readonly}
              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
              className={cn(
                form.formState.errors[question.id] && "border-destructive focus:border-destructive"
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  [QuestionType.DATE]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="flex items-center gap-2">
            {question.text}
            {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={readonly}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    form.formState.errors[question.id] && "border-destructive"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => readonly || date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  [QuestionType.DATETIME]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="flex items-center gap-2">
            {question.text}
            {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={readonly}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground",
                    form.formState.errors[question.id] && "border-destructive"
                  )}
                >
                  {field.value ? (
                    format(field.value, "PPP p")
                  ) : (
                    <span>Pick a date and time</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={(date) => readonly || date > new Date() || date < new Date("1900-01-01")}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  [QuestionType.SINGLE_SELECT]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            {question.text}
            {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readonly || false}>
            <FormControl>
              <SelectTrigger className={cn(
                form.formState.errors[question.id] && "border-destructive"
              )}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  [QuestionType.MULTI_SELECT]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="flex items-center gap-2">
              {question.text}
              {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </FormLabel>
          </div>
          <div className="space-y-2">
            {question.options?.map((option) => (
              <FormField
                key={option.id}
                control={form.control}
                name={question.id}
                render={({ field }) => {
                  return (
                    <FormItem
                      key={option.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          disabled={readonly}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || []
                            return checked
                              ? field.onChange([...currentValue, option.value])
                              : field.onChange(
                                  currentValue?.filter((value: any) => value !== option.value)
                                )
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  ),

  [QuestionType.YES_NO]: ({ question, form, readonly }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean 
  }) => (
    <FormField
      control={form.control}
      name={question.id}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="flex items-center gap-2">
              {question.text}
              {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </FormLabel>
            {question.helpText && (
              <FormDescription>
                {question.helpText}
              </FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={readonly}
            />
          </FormControl>
        </FormItem>
      )}
    />
  ),

  [QuestionType.SECTION_HEADER]: ({ question }: { question: Question }) => (
    <div className="space-y-2">
      <Separator />
      <div className="py-4">
        <h3 className="text-lg font-semibold">{question.text}</h3>
        {question.helpText && (
          <p className="text-sm text-muted-foreground mt-1">{question.helpText}</p>
        )}
      </div>
    </div>
  ),

  [QuestionType.FILE_UPLOAD]: ({ question, form, readonly, instanceId: _instanceId }: { 
    question: Question
    form: UseFormReturn<any>
    readonly?: boolean
    instanceId: string
  }) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState(false)

    const handleFileUpload = async (files: FileList | null) => {
      if (!files || files.length === 0) return

      setUploading(true)
      try {
        const fileArray = Array.from(files)
        setUploadedFiles(prev => [...prev, ...fileArray])
        
        // Update form value with file names
        const fileNames = [...uploadedFiles, ...fileArray].map(f => f.name)
        form.setValue(question.id, fileNames)
        
        // TODO: Implement actual file upload to server
        // await surveyApi.uploadAttachment(instanceId, file)
        
      } catch (error) {
        console.error('File upload error:', error)
      } finally {
        setUploading(false)
      }
    }

    const removeFile = (index: number) => {
      const newFiles = uploadedFiles.filter((_, i) => i !== index)
      setUploadedFiles(newFiles)
      form.setValue(question.id, newFiles.map(f => f.name))
    }

    return (
      <FormField
        control={form.control}
        name={question.id}
        render={({ field: _field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              {question.text}
              {question.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
            </FormLabel>
            <FormControl>
              <div className="space-y-4">
                {!readonly && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <div className="mt-4">
                        <label htmlFor={`file-${question.id}`} className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-muted-foreground">
                            Click to upload or drag and drop
                          </span>
                          <input
                            id={`file-${question.id}`}
                            type="file"
                            className="hidden"
                            multiple
                            onChange={(e) => handleFileUpload(e.target.files)}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Files:</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          {file.type.startsWith('image/') ? (
                            <ImageIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="text-sm">{file.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(file.size / 1024).toFixed(1)} KB
                          </Badge>
                        </div>
                        {!readonly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  },
}

export function DynamicFormRenderer({ 
  template, 
  form, 
  readonly = false, 
  instanceId 
}: DynamicFormRendererProps) {
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>(template.questions)
  
  // Watch form values for conditional logic
  const formValues = form.watch()
  
  // Update visible questions based on conditional logic
  useEffect(() => {
    const newVisibleQuestions = conditionalLogicEngine.getVisibleQuestions(template, formValues)
    setVisibleQuestions(newVisibleQuestions)
  }, [template, formValues])
  
  // Group questions by sections (section headers create new sections)
  const questionSections = visibleQuestions.reduce((sections, question, _index) => {
    if (question.type === QuestionType.SECTION_HEADER) {
      sections.push({
        header: question,
        questions: []
      })
    } else {
      if (sections.length === 0) {
        sections.push({
          header: null,
          questions: [question]
        })
      } else {
        const lastSection = sections[sections.length - 1]
        if (lastSection) {
          lastSection.questions.push(question)
        }
      }
    }
    return sections
  }, [] as Array<{ header: Question | null; questions: Question[] }>)
  
  return (
    <div className="space-y-6">
      {questionSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-4">
          {/* Render section header */}
          {section.header && (
            <div>
              {QuestionRenderers[QuestionType.SECTION_HEADER]({ 
                question: section.header 
              })}
            </div>
          )}
          
          {/* Render questions in this section */}
          {section.questions.length > 0 && (
            <div className="space-y-4">
              {section.questions.map((question) => {
                const Renderer = QuestionRenderers[question.type as keyof typeof QuestionRenderers]
                
                if (!Renderer) {
                  return (
                    <div key={question.id} className="p-4 border border-dashed border-muted-foreground/25 rounded-lg">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">
                          Unsupported question type: {question.type}
                        </span>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <div key={question.id} className="space-y-2">
                    <Renderer 
                      question={question} 
                      form={form} 
                      readonly={readonly}
                      instanceId={instanceId}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      
      {visibleQuestions.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No questions to display</p>
        </div>
      )}
    </div>
  )
}