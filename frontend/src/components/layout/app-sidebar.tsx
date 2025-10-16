"use client"

import * as React from "react"
import Link from "next/link"
import { Building2 } from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavDocuments } from "@/components/layout/nav-documents"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Sridhar Natarajan",
    email: "snatarajan1@amerihealthcaritas.com",
    avatar: "/avatars/user.svg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
    },
    {
      title: "Cases & Assessment",
      url: "/surveys",
    },
    {
      title: "Members",
      url: "/members",
    },
    {
      title: "Providers",
      url: "/providers",
    },
    {
      title: "Work Queue",
      url: "/work-queue",
    },
    {
      title: "Workflows",
      url: "/workflows",
    },
  ],
  navSecondary: [
    {
      title: "Reports",
      url: "/reports",
    },
    {
      title: "Integration",
      url: "/integration",
    },
    {
      title: "Settings",
      url: "/settings",
    },
    {
      title: "Examples",
      url: "/examples",
    },
  ],
  documents: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">CHC Insight</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}