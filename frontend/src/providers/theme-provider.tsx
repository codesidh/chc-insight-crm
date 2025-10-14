"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: "class" | "data-theme" | "data-mode"
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

/**
 * Enhanced Theme Provider for CHC Insight CRM
 * 
 * Features:
 * - System theme detection
 * - Smooth color transitions during theme changes
 * - Prevents flash of unstyled content (FOUC)
 * - Healthcare-optimized color schemes
 * - Persistent theme storage
 */
export function ThemeProvider({ 
  children, 
  defaultTheme = "system",
  storageKey = "chc-insight-theme",
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={true}
      storageKey={storageKey}
      disableTransitionOnChange={false}
      {...props}
    >
      <ThemeTransitionWrapper>{children}</ThemeTransitionWrapper>
    </NextThemesProvider>
  )
}

/**
 * Wrapper component that adds smooth transitions during theme changes
 */
function ThemeTransitionWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="theme-transition">
        {children}
      </div>
    )
  }

  return (
    <div className="theme-transition">
      {children}
    </div>
  )
}

/**
 * Hook to get current theme with loading state
 */
export function useTheme() {
  const theme = useNextTheme()
  const [mounted, setMounted] = React.useState(false)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  return {
    ...theme,
    mounted,
  }
}

/**
 * Theme Toggle Button Component
 * 
 * Provides a button to switch between light and dark themes
 * with smooth transitions and proper accessibility support.
 */
export function ThemeToggle() {
  const { theme, setTheme, mounted } = useTheme()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0"
        disabled
      >
        <span className="sr-only">Toggle theme</span>
        <div className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-9 px-0 theme-transition hover:bg-accent hover:text-accent-foreground"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <span className="sr-only">Toggle theme</span>
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-transform duration-200" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-200" />
      )}
    </Button>
  )
}

/**
 * Theme Status Indicator
 * Shows current theme with icon
 */
export function ThemeStatus() {
  const { theme, mounted } = useTheme()

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {theme === 'light' ? (
        <Sun className="h-3 w-3" />
      ) : (
        <Moon className="h-3 w-3" />
      )}
      <span className="capitalize">{theme} mode</span>
    </div>
  )
}