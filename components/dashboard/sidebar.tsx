"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Wrench, 
  User, 
  ChevronLeft,
  Menu,
  MonitorCog,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const navigation = [
  { name: "Přehled", href: "/", icon: LayoutDashboard },
  { name: "Nástroje", href: "/tools", icon: Wrench },
  { name: "Stroje", href: "/machines", icon:  MonitorCog},
  { name: "Uživatel", href: "/user", icon: User },
]

interface SidebarProps {
  name: string;
  icon: string;
}

export function DashboardSidebar({
   name,
  icon,
}: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="ml-4 flex items-center gap-2">
           <Image width={32} height={32} src={"/icons/"+icon}  alt="Ikona" className="rounded-lg h-9 w-9 text-primary-foreground" />

          <span className="font-semibold text-sidebar-foreground">{name}</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {collapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-50 transition-all duration-300",
        "lg:translate-x-0",
        collapsed ? "translate-x-0 w-64" : "-translate-x-full lg:w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
              
                 <Image width={32} height={32} src={"/icons/"+icon}  alt="Ikona" className="rounded-lg h-9 w-9 text-primary-foreground" />

              <div className="flex flex-col">
                <span className="font-semibold text-sidebar-foreground text-sm">{name}</span>
                <span className="text-xs text-muted-foreground">Tool Management</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(false)}
              className="lg:hidden text-sidebar-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setCollapsed(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4",
                      isActive ? "text-primary" : ""
                    )} />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border flex flex-col gap-2">
            {/* Nastavení */}
            

            
          </div>
        </div>
      </aside>
    </>
  )
}
