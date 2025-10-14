"use client"

import * as React from "react"
import { Search, User, Building2, FileText, Settings } from "lucide-react"
import {
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

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'member' | 'provider' | 'survey' | 'setting'
  url: string
}

interface SearchCommandProps {
  onSelect?: (result: SearchResult) => void
  placeholder?: string
}

export function SearchCommand({ onSelect, placeholder = "Search..." }: SearchCommandProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  // Mock search results - in real app, this would come from API
  const searchResults: SearchResult[] = [
    {
      id: "1",
      title: "John Doe",
      description: "Member ID: M123456",
      type: "member",
      url: "/members/1"
    },
    {
      id: "2",
      title: "ABC Healthcare",
      description: "Provider NPI: 1234567890",
      type: "provider",
      url: "/providers/2"
    },
    {
      id: "3",
      title: "Initial Assessment Survey",
      description: "LTSS Assessment Template",
      type: "survey",
      url: "/surveys/3"
    },
    {
      id: "4",
      title: "User Management",
      description: "Manage system users and roles",
      type: "setting",
      url: "/admin/users"
    }
  ]

  const filteredResults = searchResults.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase()) ||
    result.description?.toLowerCase().includes(query.toLowerCase())
  )

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'member':
        return <User className="h-4 w-4" />
      case 'provider':
        return <Building2 className="h-4 w-4" />
      case 'survey':
        return <FileText className="h-4 w-4" />
      case 'setting':
        return <Settings className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const handleSelect = (result: SearchResult) => {
    setOpen(false)
    setQuery("")
    onSelect?.(result)
  }

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
        {placeholder}
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder={placeholder} 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {filteredResults.length > 0 && (
            <>
              <CommandGroup heading="Members">
                {filteredResults
                  .filter(result => result.type === 'member')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                    >
                      {getIcon(result.type)}
                      <div className="ml-2">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Providers">
                {filteredResults
                  .filter(result => result.type === 'provider')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                    >
                      {getIcon(result.type)}
                      <div className="ml-2">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Surveys">
                {filteredResults
                  .filter(result => result.type === 'survey')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                    >
                      {getIcon(result.type)}
                      <div className="ml-2">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground">
                            {result.description}
                          </div>
                        )}
                      </div>
                      <CommandShortcut>⌘S</CommandShortcut>
                    </CommandItem>
                  ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading="Settings">
                {filteredResults
                  .filter(result => result.type === 'setting')
                  .map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.title}
                      onSelect={() => handleSelect(result)}
                    >
                      {getIcon(result.type)}
                      <div className="ml-2">
                        <div className="font-medium">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground">
                            {result.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}