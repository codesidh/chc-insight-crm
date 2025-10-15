"use client"

import dynamic from 'next/dynamic'
import { FormSkeleton } from '@/components/ui/loading-skeleton'

export const SurveyTemplateForm = dynamic(
  () => import('./form-examples').then(mod => ({ default: mod.SurveyTemplateForm })),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
)

export const MemberAssessmentForm = dynamic(
  () => import('./form-examples').then(mod => ({ default: mod.MemberAssessmentForm })),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
)