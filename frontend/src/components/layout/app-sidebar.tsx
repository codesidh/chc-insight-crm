"use client"

import * as React from "react"
import Link from "next/link"
import {
  Building2,
  BarChart3,
  FileText,
  Home,
  Users,
  Workflow,
  BriefcaseMedical,
  Settings2,
  HelpCircle,
  ClipboardList,
  LifeBuoy,
  Send,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavProjects } from "@/components/layout/nav-projects"
import { NavSecondary } from "@/components/layout/nav-secondary"
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

// CHC Insight CRM data structure
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
      icon: Home,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Cases & Assessment",
      url: "/surveys",
      icon: FileText,
      items: [
        {
          title: "Active Cases",
          url: "/surveys",
        },
      ],
    },
    {
      title: "Members",
      url: "/members",
      icon: Users,
      items: [
        {
          title: "Member Directory",
          url: "/members",
        },
      ],
    },
    {
      title: "Providers",
      url: "/providers",
      icon: BriefcaseMedical,
      items: [
        {
          title: "Provider Network",
          url: "/providers",
        },
      ],
    },
    {
      title: "Work Queue",
      url: "/work-queue",
      icon: ClipboardList,
      items: [
        {
          title: "Active Tasks",
          url: "/work-queue",
        },
      ],
    },
    {
      title: "Workflows",
      url: "/workflows",
      icon: Workflow,
      items: [
        {
          title: "Active Workflows",
          url: "/workflows",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
  projects: [
    {
      name: "Examples",
      url: "/examples",
      icon: HelpCircle,
    },
    {
      name: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      name: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">CHC Insight</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}