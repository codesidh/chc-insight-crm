"use client"

import * as React from "react"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface AppLayoutProps {
  children: React.ReactNode
  headerTitle?: string
}

// Memoize the layout styles to prevent re-creation
const layoutStyles = {
  "--sidebar-width": "18rem",
  "--header-height": "4rem",
} as React.CSSProperties

export const AppLayout = React.memo(function AppLayout({ 
  children, 
  headerTitle = "Dashboard" 
}: AppLayoutProps) {
  return (
    <SidebarProvider style={layoutStyles}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader title={headerTitle} />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
})