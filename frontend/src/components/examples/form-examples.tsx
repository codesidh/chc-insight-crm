"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Upload, X } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getSurveyTypes, getReminderFrequencies, getAssessmentTypes, getLevelsOfCare, getCareNeedsOptions } from "@/lib/example-data"


// Survey Template Form Schema
const surveyTemplateSchema = z.object({
  name: z.string().min(1, "Survey name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  surveyType: z.enum(["initial_assessment", "reassessment", "provider_survey", "incident_report", "satisfaction_survey"]),
  isActive: z.boolean(),
  effectiveDate: z.date({
    message: "Effective date is required",
  }),
  expirationDate: z.date().optional(),
  dueDateDays: z.number().min(1, "Due date must be at least 1 day").max(365, "Due date cannot exceed 365 days"),
  reminderFrequency: z.enum(["daily", "weekly", "biweekly"]),
  autoAssign: z.boolean(),
  assignmentRules: z.array(z.string()).optional(),
  businessRules: z.object({
    allowDuplicates: z.boolean(),
    requireApproval: z.boolean(),
    escalationDays: z.number().min(1).max(30),
  }),
})

type SurveyTemplateFormData = z.infer<typeof surveyTemplateSchema>

// Member Assessment Form Schema
const memberAssessmentSchema = z.object({
  memberId: z.string().min(1, "Member ID is required"),
  memberName: z.string().min(1, "Member name is required"),
  assessmentDate: z.date({
    message: "Assessment date is required",
  }),
  assessmentType: z.enum(["initial", "annual", "change_in_condition", "other"]),
  levelOfCare: z.enum(["community", "assisted_living", "nursing_home", "home_health"]),
  picsScore: z.number().min(0).max(100),
  cognitiveStatus: z.enum(["intact", "mild_impairment", "moderate_impairment", "severe_impairment"]),
  functionalStatus: z.object({
    adlScore: z.number().min(0).max(28),
    iadlScore: z.number().min(0).max(8),
    mobilityScore: z.number().min(0).max(12),
  }),
  healthConditions: z.array(z.string()),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
  })),
  careNeeds: z.object({
    personalCare: z.boolean(),
    homemaker: z.boolean(),
    nursing: z.boolean(),
    therapy: z.boolean(),
    transportation: z.boolean(),
  }),
  notes: z.string().optional(),
  attachments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  })).optional(),
})

type MemberAssessmentFormData = z.infer<typeof memberAssessmentSchema>

// Survey Template Creation Form
export function SurveyTemplateForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitProgress, setSubmitProgress] = React.useState(0)

  const form = useForm<SurveyTemplateFormData>({
    resolver: zodResolver(surveyTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      surveyType: "initial_assessment",
      isActive: true,
      dueDateDays: 30,
      reminderFrequency: "weekly",
      autoAssign: false,
      businessRules: {
        allowDuplicates: false,
        requireApproval: true,
        escalationDays: 7,
      },
    },
  })

  const onSubmit = async (data: SurveyTemplateFormData) => {
    setIsSubmitting(true)
    setSubmitProgress(0)

    // Simulate form submission with progress
    for (let i = 0; i <= 100; i += 10) {
      setSubmitProgress(i)
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log("Survey Template Data:", data)
    setIsSubmitting(false)
    setSubmitProgress(0)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Survey Template</CardTitle>
        <CardDescription>
          Configure a new survey template with validation rules and business logic
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter survey name" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this survey template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surveyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Survey Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select survey type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getSurveyTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter survey description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description of the survey purpose and scope
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Effective Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When this survey template becomes active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiration Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No expiration</span>
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
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Optional expiration date for this template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Business Rules</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dueDateDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date (Days) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days from assignment to due date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reminderFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Frequency *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getReminderFrequencies().map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Template</FormLabel>
                        <FormDescription>
                          Enable this template for new survey assignments
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

                <FormField
                  control={form.control}
                  name="autoAssign"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Auto-Assignment</FormLabel>
                        <FormDescription>
                          Automatically assign surveys based on rules
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

                <FormField
                  control={form.control}
                  name="businessRules.requireApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Approval</FormLabel>
                        <FormDescription>
                          Surveys must be approved before completion
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
              </div>
            </div>

            {/* Submit Section */}
            {isSubmitting && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Creating survey template...</span>
                      <span>{submitProgress}%</span>
                    </div>
                    <Progress value={submitProgress} className="w-full" />
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Member Assessment Form with Complex Validation
export function MemberAssessmentForm() {
  const [attachments, setAttachments] = React.useState<File[]>([])

  const form = useForm<MemberAssessmentFormData>({
    resolver: zodResolver(memberAssessmentSchema),
    defaultValues: {
      assessmentType: "initial",
      levelOfCare: "community",
      picsScore: 0,
      cognitiveStatus: "intact",
      functionalStatus: {
        adlScore: 0,
        iadlScore: 0,
        mobilityScore: 0,
      },
      healthConditions: [],
      medications: [],
      careNeeds: {
        personalCare: false,
        homemaker: false,
        nursing: false,
        therapy: false,
        transportation: false,
      },
    },
  })

  const onSubmit = (data: MemberAssessmentFormData) => {
    console.log("Assessment Data:", data)
    console.log("Attachments:", attachments)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Member Assessment</CardTitle>
        <CardDescription>
          Complete comprehensive member assessment with validation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Member Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="memberId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="memberName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Member Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter member name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Assessment Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="assessmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Assessment Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
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
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assessmentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assessment Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAssessmentTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="levelOfCare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level of Care *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getLevelsOfCare().map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Care Needs Checkboxes */}
            <FormField
              control={form.control}
              name="careNeeds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Care Needs</FormLabel>
                    <FormDescription>
                      Select all applicable care needs for this member
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {getCareNeedsOptions().map((item) => (
                      <FormField
                        key={item.key}
                        control={form.control}
                        name={`careNeeds.${item.key}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                {item.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachments */}
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, JPG, PNG (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                  
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files:</Label>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{file.type}</Badge>
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload supporting documents for this assessment
              </FormDescription>
            </FormItem>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button type="submit">
                Submit Assessment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}