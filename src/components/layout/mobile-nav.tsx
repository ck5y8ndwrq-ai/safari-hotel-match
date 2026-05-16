"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Hotel,
  Search,
  Users,
  FileText,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "工作台", icon: LayoutDashboard },
  { href: "/hotels", label: "酒店管理", icon: Hotel },
  { href: "/matching", label: "智能匹配", icon: Search },
  { href: "/customers", label: "客户管理", icon: Users },
  { href: "/orders", label: "订单管理", icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-56 p-0">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold text-lg">🦁 动物王国 Animalia</span>
        </div>
        <nav className="p-3 space-y-1">
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
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
