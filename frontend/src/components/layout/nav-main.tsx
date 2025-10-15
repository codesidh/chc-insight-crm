"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FileText, 
  Home, 
  Users, 
  Workflow,
  Building2,
  Plus
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const iconMap = {
  "/": Home,
  "/dashboard": Home,
  "/surveys": FileText,
  "/members": Users,
  "/providers": Building2,
  "/workflows": Workflow,
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
  }[]
}) {
  const pathname = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <Plus className="h-4 w-4" />
              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = iconMap[item.url as keyof typeof iconMap] || Home
            const isActive = pathname === item.url || (pathname === "/" && item.url === "/dashboard")
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild isActive={isActive}>
                  <Link href={item.url}>
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}