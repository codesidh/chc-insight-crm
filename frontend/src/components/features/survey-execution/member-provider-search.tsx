'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, User, Building, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

import { useTypeAheadSearch, usePrePopulationData } from '@/hooks/use-search'
import { useDebounce } from '@/hooks/use-debounce'

interface Member {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  planType: string
  ltssType?: string
  levelOfCare?: string
  picsScore?: number
  assignedCoordinator?: string
  memberNumber?: string
}

interface Provider {
  id: string
  npi: string
  name: string
  specialty: string
  networkStatus: 'in_network' | 'out_of_network'
  contactInfo: {
    phone?: string
    email?: string
    address?: string
  }
}

interface MemberProviderSearchProps {
  searchType: 'member' | 'provider'
  onSelect: (item: Member | Provider) => void
  onPrePopulationData?: (data: any) => void
  selectedId?: string
  placeholder?: string
  disabled?: boolean
  className?: string
}

interface SearchResultItemProps {
  item: Member | Provider
  type: 'member' | 'provider'
  isSelected?: boolean
}

function SearchResultItem({ item, type, isSelected }: SearchResultItemProps) {
  if (type === 'member') {
    const member = item as Member
    return (
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-foreground truncate">
                {member.firstName} {member.lastName}
              </p>
              {member.memberNumber && (
                <Badge variant="secondary" className="text-xs">
                  {member.memberNumber}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-xs text-muted-foreground">
                DOB: {new Date(member.dateOfBirth).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Plan: {member.planType}
              </p>
              {member.levelOfCare && (
                <p className="text-xs text-muted-foreground">
                  LOC: {member.levelOfCare}
                </p>
              )}
            </div>
          </div>
        </div>
        {isSelected && <Check className="h-4 w-4 text-primary" />}
      </div>
    )
  }

  const provider = item as Provider
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center space-x-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <Building className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-foreground truncate">
              {provider.name}
            </p>
            <Badge 
              variant={provider.networkStatus === 'in_network' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {provider.networkStatus === 'in_network' ? 'In Network' : 'Out of Network'}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-xs text-muted-foreground">
              NPI: {provider.npi}
            </p>
            <p className="text-xs text-muted-foreground">
              {provider.specialty}
            </p>
          </div>
        </div>
      </div>
      {isSelected && <Check className="h-4 w-4 text-primary" />}
    </div>
  )
}

export function MemberProviderSearch({
  searchType,
  onSelect,
  onPrePopulationData,
  selectedId: _selectedId,
  placeholder,
  disabled = false,
  className
}: MemberProviderSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItem, setSelectedItem] = useState<Member | Provider | null>(null)
  
  const debouncedQuery = useDebounce(searchQuery, 300)
  
  // Search for members or providers
  const { data: searchResults, isLoading, error } = useTypeAheadSearch(
    searchType,
    debouncedQuery,
    {
      limit: 10,
      enabled: debouncedQuery.length >= 2 && open
    }
  )
  
  // Get pre-population data when member is selected
  const { data: prePopData, isLoading: prePopLoading } = usePrePopulationData(
    searchType === 'member' ? selectedItem?.id : undefined,
    searchType === 'provider' ? selectedItem?.id : undefined
  )
  
  // Handle item selection
  const handleSelect = (item: Member | Provider) => {
    setSelectedItem(item)
    setOpen(false)
    setSearchQuery('')
    onSelect(item)
  }
  
  // Handle pre-population data
  useEffect(() => {
    if (prePopData?.data && onPrePopulationData) {
      onPrePopulationData(prePopData.data)
    }
  }, [prePopData, onPrePopulationData])
  
  // Find selected item display name
  const getDisplayValue = () => {
    if (!selectedItem) return placeholder || `Search ${searchType}...`
    
    if (searchType === 'member') {
      const member = selectedItem as Member
      return `${member.firstName} ${member.lastName}`
    } else {
      const provider = selectedItem as Provider
      return provider.name
    }
  }
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Component */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-2">
              {searchType === 'member' ? (
                <User className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Building className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={cn(
                "truncate",
                !selectedItem && "text-muted-foreground"
              )}>
                {getDisplayValue()}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder={`Search ${searchType}s...`}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                </div>
              )}
              
              {error && (
                <div className="p-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to search {searchType}s. Please try again.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              {!isLoading && !error && searchResults?.length === 0 && debouncedQuery.length >= 2 && (
                <CommandEmpty>
                  No {searchType}s found matching &quot;{debouncedQuery}&quot;
                </CommandEmpty>
              )}
              
              {!isLoading && debouncedQuery.length < 2 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}
              
              {searchResults && searchResults.length > 0 && (
                <CommandGroup>
                  {searchResults.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => handleSelect(item)}
                      className="p-3"
                    >
                      <SearchResultItem
                        item={item}
                        type={searchType}
                        isSelected={selectedItem?.id === item.id}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected Item Details */}
      {selectedItem && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center space-x-2">
              {searchType === 'member' ? (
                <User className="h-4 w-4" />
              ) : (
                <Building className="h-4 w-4" />
              )}
              <span>Selected {searchType === 'member' ? 'Member' : 'Provider'}</span>
              {prePopLoading && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {searchType === 'member' ? (
              <MemberDetails member={selectedItem as Member} prePopData={prePopData?.data} />
            ) : (
              <ProviderDetails provider={selectedItem as Provider} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function MemberDetails({ member, prePopData }: { member: Member; prePopData?: any }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Name:</span>
          <p className="font-medium">{member.firstName} {member.lastName}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Date of Birth:</span>
          <p className="font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Plan Type:</span>
          <p className="font-medium">{member.planType}</p>
        </div>
        {member.levelOfCare && (
          <div>
            <span className="text-muted-foreground">Level of Care:</span>
            <p className="font-medium">{member.levelOfCare}</p>
          </div>
        )}
      </div>
      
      {prePopData && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Additional Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {prePopData.ltssType && (
                <div>
                  <span className="text-muted-foreground">LTSS Type:</span>
                  <p className="font-medium">{prePopData.ltssType}</p>
                </div>
              )}
              {prePopData.picsScore && (
                <div>
                  <span className="text-muted-foreground">PICS Score:</span>
                  <p className="font-medium">{prePopData.picsScore}</p>
                </div>
              )}
              {prePopData.assignedCoordinator && (
                <div>
                  <span className="text-muted-foreground">Coordinator:</span>
                  <p className="font-medium">{prePopData.assignedCoordinator}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProviderDetails({ provider }: { provider: Provider }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Name:</span>
          <p className="font-medium">{provider.name}</p>
        </div>
        <div>
          <span className="text-muted-foreground">NPI:</span>
          <p className="font-medium">{provider.npi}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Specialty:</span>
          <p className="font-medium">{provider.specialty}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Network Status:</span>
          <Badge 
            variant={provider.networkStatus === 'in_network' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {provider.networkStatus === 'in_network' ? 'In Network' : 'Out of Network'}
          </Badge>
        </div>
      </div>
      
      {provider.contactInfo && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="space-y-1 text-sm">
              {provider.contactInfo.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{provider.contactInfo.phone}</p>
                </div>
              )}
              {provider.contactInfo.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{provider.contactInfo.email}</p>
                </div>
              )}
              {provider.contactInfo.address && (
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{provider.contactInfo.address}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}