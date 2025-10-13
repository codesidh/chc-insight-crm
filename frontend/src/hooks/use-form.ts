import { useForm as useReactHookForm, UseFormProps, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEffect, useRef } from 'react'

// Enhanced useForm hook with Zod integration
export function useForm<TFieldValues extends FieldValues = FieldValues>(
  schema: z.ZodSchema<TFieldValues>,
  props?: Omit<UseFormProps<TFieldValues>, 'resolver'>
) {
  return useReactHookForm<TFieldValues>({
    // @ts-ignore - zodResolver type compatibility issue
    resolver: zodResolver(schema),
    mode: 'onChange', // Validate on change for better UX
    ...props,
  })
}

// Auto-save hook for forms
import { UseFormWatch } from 'react-hook-form'
import { useDebounce } from './use-debounce'

interface UseAutoSaveOptions<T extends FieldValues> {
  watch: UseFormWatch<T>
  onSave: (data: T) => Promise<void> | void
  delay?: number
  enabled?: boolean
}

export function useAutoSave<T extends FieldValues>({
  watch,
  onSave,
  delay = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const watchedData = watch()
  const debouncedData = useDebounce(watchedData, delay)
  const initialRender = useRef(true)

  useEffect(() => {
    // Skip auto-save on initial render
    if (initialRender.current) {
      initialRender.current = false
      return
    }

    if (enabled && debouncedData) {
      onSave(debouncedData)
    }
  }, [debouncedData, onSave, enabled])
}

// Form state persistence hook
import { UseFormSetValue, UseFormGetValues } from 'react-hook-form'

interface UseFormPersistenceOptions<T extends FieldValues> {
  key: string
  setValue: UseFormSetValue<T>
  getValues: UseFormGetValues<T>
  enabled?: boolean
}

export function useFormPersistence<T extends FieldValues>({
  key,
  setValue,
  getValues,
  enabled = true,
}: UseFormPersistenceOptions<T>) {
  // Load saved data on mount
  useEffect(() => {
    if (!enabled) return

    try {
      const savedData = localStorage.getItem(`form_${key}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        Object.entries(parsedData).forEach(([fieldName, value]) => {
          setValue(fieldName as any, value as any)
        })
      }
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error)
    }
  }, [key, setValue, enabled])

  // Save data to localStorage
  const saveToStorage = () => {
    if (!enabled) return

    try {
      const currentData = getValues()
      localStorage.setItem(`form_${key}`, JSON.stringify(currentData))
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error)
    }
  }

  // Clear saved data
  const clearStorage = () => {
    try {
      localStorage.removeItem(`form_${key}`)
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error)
    }
  }

  return { saveToStorage, clearStorage }
}

// Form validation utilities
export const formUtils = {
  // Get error message for a field
  getErrorMessage: (error: any): string => {
    if (typeof error?.message === 'string') {
      return error.message
    }
    return 'This field is invalid'
  },

  // Check if field has error
  hasError: (error: any): boolean => {
    return !!error
  },

  // Get field state classes for styling
  getFieldStateClasses: (error: any, isDirty: boolean, isValid: boolean) => {
    if (error) return 'border-destructive focus:border-destructive'
    if (isDirty && isValid) return 'border-green-500 focus:border-green-500'
    return ''
  },

  // Format validation errors for display
  formatErrors: (errors: Record<string, any>): string[] => {
    const errorMessages: string[] = []
    
    const extractErrors = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fieldName = prefix ? `${prefix}.${key}` : key
        
        if (value && typeof value === 'object' && 'message' in value) {
          errorMessages.push(`${fieldName}: ${value.message}`)
        } else if (value && typeof value === 'object') {
          extractErrors(value, fieldName)
        }
      })
    }
    
    extractErrors(errors)
    return errorMessages
  },
}

// Custom form field component props
export interface FormFieldProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

// Form section component for organizing complex forms
export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

// Export commonly used form types
export type FormErrors<T> = Partial<Record<keyof T, { message: string }>>
export type FormTouched<T> = Partial<Record<keyof T, boolean>>
export type FormValues<T extends z.ZodSchema> = z.infer<T>