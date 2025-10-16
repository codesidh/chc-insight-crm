"use client"

import * as React from "react"
import Link from "next/link"
import { Shield, Settings, HelpCircle } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const iconMap = {
  "/reports": Shield,
  "/settings": Settings,
  "/examples": HelpCircle 
}

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const Icon = iconMap[item.title as keyof typeof iconMap] || iconMap[item.url as keyof typeof iconMap] || Settings
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
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