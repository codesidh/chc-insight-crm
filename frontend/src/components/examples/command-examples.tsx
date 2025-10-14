"use client"

import * as React from "react"
import {
  Search,
  User,
  Building2,
  FileText,
  Calendar,
  Settings,
  Plus,
  Filter,
  Download,
} from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { getMembers, getProviders, getSurveys } from "@/lib/example-data"

// Extract data from JSON using utility functions
const members = getMembers()
const providers = getProviders()
const surveys = getSurveys()

// Global Command Palette
export function GlobalCommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search...
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>Create New Survey</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>View Work Queue</span>
              <CommandShortcut>⌘Q</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Download className="mr-2 h-4 w-4" />
              <span>Export Reports</span>
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Surveys</span>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Members</span>
            </CommandItem>
            <CommandItem>
              <Building2 className="mr-2 h-4 w-4" />
              <span>Providers</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent Surveys">
            {surveys.slice(0, 3).map((survey) => (
              <CommandItem key={survey.id}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{survey.name}</span>
                <Badge variant="secondary" className="ml-auto">
                  {survey.type}
                </Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

// Member Search Command
export function MemberSearchCommand({ onSelect }: { onSelect?: (member: any) => void }) {
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.memberId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search members by name or ID..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No members found.</CommandEmpty>
        <CommandGroup heading="Members">
          {filteredMembers.map((member) => (
            <CommandItem
              key={member.id}
              onSelect={() => onSelect?.(member)}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{member.name}</span>
                <span className="text-sm text-muted-foreground">
                  ID: {member.memberId} • Plan: {member.plan}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

// Provider Search Command
export function ProviderSearchCommand({ onSelect }: { onSelect?: (provider: any) => void }) {
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const filteredProviders = providers.filter(
    (provider) =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.npi.includes(searchTerm) ||
      provider.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search providers by name, NPI, or specialty..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No providers found.</CommandEmpty>
        <CommandGroup heading="Providers">
          {filteredProviders.map((provider) => (
            <CommandItem
              key={provider.id}
              onSelect={() => onSelect?.(provider)}
              className="cursor-pointer"
            >
              <Building2 className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{provider.name}</span>
                <span className="text-sm text-muted-foreground">
                  NPI: {provider.npi} • {provider.specialty}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

// Survey Template Search Command
export function SurveySearchCommand({ onSelect }: { onSelect?: (survey: any) => void }) {
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput 
        placeholder="Search survey templates..." 
        value={searchTerm}
        onValueChange={setSearchTerm}
      />
      <CommandList>
        <CommandEmpty>No survey templates found.</CommandEmpty>
        <CommandGroup heading="Survey Templates">
          {filteredSurveys.map((survey) => (
            <CommandItem
              key={survey.id}
              onSelect={() => onSelect?.(survey)}
              className="cursor-pointer"
            >
              <FileText className="mr-2 h-4 w-4" />
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="font-medium">{survey.name}</span>
                  <span className="text-sm text-muted-foreground">{survey.type}</span>
                </div>
                <Badge 
                  variant={survey.status === "Active" ? "default" : "secondary"}
                  className="ml-2"
                >
                  {survey.status}
                </Badge>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

// Filter Command for Work Queue
export function WorkQueueFilterCommand({ onFilterChange }: { onFilterChange?: (filters: any) => void }) {
  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([])

  const toggleFilter = (filter: string) => {
    const newFilters = selectedFilters.includes(filter)
      ? selectedFilters.filter(f => f !== filter)
      : [...selectedFilters, filter]
    
    setSelectedFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Filter work queue..." />
      <CommandList>
        <CommandGroup heading="Status">
          <CommandItem onSelect={() => toggleFilter("pending")}>
            <Filter className="mr-2 h-4 w-4" />
            <span>Pending Review</span>
            {selectedFilters.includes("pending") && (
              <Badge variant="secondary" className="ml-auto">Selected</Badge>
            )}
          </CommandItem>
          <CommandItem onSelect={() => toggleFilter("overdue")}>
            <Filter className="mr-2 h-4 w-4" />
            <span>Overdue</span>
            {selectedFilters.includes("overdue") && (
              <Badge variant="secondary" className="ml-auto">Selected</Badge>
            )}
          </CommandItem>
          <CommandItem onSelect={() => toggleFilter("approved")}>
            <Filter className="mr-2 h-4 w-4" />
            <span>Approved</span>
            {selectedFilters.includes("approved") && (
              <Badge variant="secondary" className="ml-auto">Selected</Badge>
            )}
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Survey Type">
          <CommandItem onSelect={() => toggleFilter("assessment")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Assessments</span>
            {selectedFilters.includes("assessment") && (
              <Badge variant="secondary" className="ml-auto">Selected</Badge>
            )}
          </CommandItem>
          <CommandItem onSelect={() => toggleFilter("provider")}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Provider Surveys</span>
            {selectedFilters.includes("provider") && (
              <Badge variant="secondary" className="ml-auto">Selected</Badge>
            )}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}