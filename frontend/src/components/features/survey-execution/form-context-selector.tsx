'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  User, 
  Building, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react'

import { FormTemplate } from '@/types'
import { MemberProviderSearch } from './member-provider-search'

interface FormContextSelectorProps {
  template: FormTemplate
  onContextSelected: (context: FormContext) => void
  onCancel?: () => void
  className?: string
}

interface FormContext {
  templateId: string
  memberId: string | undefined
  providerId: string | undefined
  contextData?: Record<string, any>
  prePopulationData?: Record<string, any>
}

interface Member {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  planType: string
  memberNumber?: string
}

interface Provider {
  id: string
  npi: string
  name: string
  specialty: string
  networkStatus: 'in_network' | 'out_of_network'
}

// Determine what context is required based on form template
const getRequiredContext = (template: FormTemplate) => {
  // This would be based on the form category and type
  // For now, we'll use some basic logic
  const requiresMember = true // Most forms require a member
  const requiresProvider = template.name.toLowerCase().includes('provider') || 
                          template.name.toLowerCase().includes('referral')
  
  return {
    requiresMember,
    requiresProvider,
    allowsOptionalProvider: !requiresProvider // Allow optional provider if not required
  }
}

export function FormContextSelector({ 
  template, 
  onContextSelected, 
  onCancel,
  className: _className 
}: FormContextSelectorProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [memberPrePopData, setMemberPrePopData] = useState<any>(null)
  const [providerPrePopData, setProviderPrePopData] = useState<any>(null)
  
  const contextRequirements = getRequiredContext(template)
  
  const canProceed = () => {
    if (contextRequirements.requiresMember && !selectedMember) return false
    if (contextRequirements.requiresProvider && !selectedProvider) return false
    return true
  }
  
  const handleProceed = () => {
    const context: FormContext = {
      templateId: template.id,
      memberId: selectedMember?.id,
      providerId: selectedProvider?.id,
      contextData: {
        member: selectedMember,
        provider: selectedProvider,
        selectedAt: new Date().toISOString()
      },
      prePopulationData: {
        ...memberPrePopData,
        ...providerPrePopData
      }
    }
    
    onContextSelected(context)
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Form Template Information */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <Badge variant="outline">v{template.version}</Badge>
              </div>
              {template.description && (
                <CardDescription className="text-base">
                  {template.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{template.questions.length} questions</span>
            {template.dueDateCalculation && (
              <span>Due in {template.dueDateCalculation.value} {template.dueDateCalculation.type}</span>
            )}
          </div>
        </CardHeader>
      </Card>
      
      {/* Context Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Context</CardTitle>
          <CardDescription>
            Select the required context for this form before proceeding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Requirements Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {contextRequirements.requiresMember && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-sm">Member selection is required</span>
                  </div>
                )}
                {contextRequirements.requiresProvider && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-sm">Provider selection is required</span>
                  </div>
                )}
                {contextRequirements.allowsOptionalProvider && !contextRequirements.requiresProvider && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-3 w-3 text-blue-500" />
                    <span className="text-sm">Provider selection is optional</span>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
          
          {/* Member Selection */}
          {contextRequirements.requiresMember && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <h3 className="text-base font-medium">Select Member</h3>
                {contextRequirements.requiresMember && (
                  <Badge variant="destructive" className="text-xs">Required</Badge>
                )}
              </div>
              
              <MemberProviderSearch
                searchType="member"
                onSelect={(member) => setSelectedMember(member as Member)}
                onPrePopulationData={setMemberPrePopData}
                placeholder="Search for a member..."
              />
            </div>
          )}
          
          {/* Provider Selection */}
          {(contextRequirements.requiresProvider || contextRequirements.allowsOptionalProvider) && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <h3 className="text-base font-medium">Select Provider</h3>
                  {contextRequirements.requiresProvider ? (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  )}
                </div>
                
                <MemberProviderSearch
                  searchType="provider"
                  onSelect={(provider) => setSelectedProvider(provider as Provider)}
                  onPrePopulationData={setProviderPrePopData}
                  placeholder="Search for a provider..."
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Pre-population Preview */}
      {(memberPrePopData || providerPrePopData) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Pre-population Preview</CardTitle>
            <CardDescription>
              The following data will be automatically filled in the form.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberPrePopData && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Member Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(memberPrePopData).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <p className="font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {providerPrePopData && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Provider Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {Object.entries(providerPrePopData).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <p className="font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Validation Errors */}
      {!canProceed() && (selectedMember || selectedProvider) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please complete the required selections:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {contextRequirements.requiresMember && !selectedMember && (
                  <li>Member selection is required</li>
                )}
                {contextRequirements.requiresProvider && !selectedProvider && (
                  <li>Provider selection is required</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {canProceed() ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Ready to start form</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Complete required selections to proceed</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              <Button 
                onClick={handleProceed}
                disabled={!canProceed()}
                className="gap-2"
              >
                Start Form
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}