"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  // Helper function to check if a menu item or its subitems are active
  const isItemActive = (item: typeof items[0]) => {
    // Handle root path - if we're at "/" and item is "/dashboard", consider it active
    if (pathname === "/" && item.url === "/dashboard") return true
    
    // Check if main item URL matches current path
    if (pathname === item.url) return true
    
    // Check if any subitem URL matches current path
    if (item.items) {
      return item.items.some(subItem => {
        // Handle root path for subitems too
        if (pathname === "/" && subItem.url === "/dashboard") return true
        return pathname === subItem.url || pathname.startsWith(`${subItem.url}/`)
      })
    }
    
    // Check if current path starts with item URL (for nested routes)
    return pathname.startsWith(`${item.url}/`)
  }

  // Helper function to check if submenu should be open
  const shouldBeOpen = (item: typeof items[0]) => {
    return isItemActive(item) || item.isActive
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemActive = isItemActive(item)
          const shouldOpen = shouldBeOpen(item)
          
          return (
            <Collapsible key={item.title} asChild defaultOpen={shouldOpen || false}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={itemActive}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const subItemActive = (pathname === "/" && subItem.url === "/dashboard") || 
                                                         pathname === subItem.url || 
                                                         pathname.startsWith(`${subItem.url}/`)
                          
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={subItemActive}>
                                <Link href={subItem.url}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}