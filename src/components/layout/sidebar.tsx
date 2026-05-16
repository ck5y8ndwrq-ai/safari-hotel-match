"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Hotel,
  Search,
  Users,
  FileText,
  MapPin,
  Settings,
  LogOut,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/hotels", label: "酒店管理", icon: Hotel },
  { href: "/hotels/import", label: "批量导入", icon: Upload },
  { href: "/matching", label: "智能匹配", icon: Search },
  { href: "/customers", label: "客户管理", icon: Users },
  { href: "/orders", label: "订单管理", icon: FileText },
  { href: "/regions", label: "区域管理", icon: MapPin },
  { href: "/settings", label: "系统设置", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-56 flex-col border-r bg-sidebar-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-primary">🦁</span>
          <span>动物王国 Animalia</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button variant="ghost" className="w-full justify-start text-sm text-sidebar-foreground" asChild>
          <Link href="/login">
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Link>
        </Button>
      </div>
    </aside>
  );
}
