"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Droplet,
  Timer,
  LogOut,
  FileText,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Painel", href: "/dashboard" },
  { icon: Droplet, label: "Calculadoras", href: "/dashboard?tab=calc" },
  { icon: Timer, label: "Timer Banho", href: "/dashboard?tab=timer" },
  { icon: FileText, label: "Minhas Contas", href: "/dashboard?tab=ai" },
  { icon: Home, label: "Dicas", href: "/dashboard?tab=guide" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar border-sidebar-border text-sidebar-foreground sticky top-0 hidden h-screen w-64 flex-col border-r md:flex">
      {/* Header: Tornar apenas o ícone clicável para ir ao login */}
      <div className="border-sidebar-border border-b p-6">
        <div className="flex items-center gap-2 text-xl font-bold text-blue-400">
          {/* Link só no ícone (vai para /login-form) */}
          <Link href="http://localhost:3000/" aria-label="Ir para o login">
            <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
              <Droplet size={18} fill="currentColor" />
            </div>
          </Link>

          {/* Texto permanece estático; se quiser que o texto também navegue, envolva-o em Link também */}
          <span>Água Inteligente</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              pathname === item.href ||
                (item.href.includes("?") && pathname === "/dashboard")
                ? "bg-blue-500/10 text-blue-400"
                : "text-blue-400 hover:bg-blue-500/10 hover:text-blue-300",
            )}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-sidebar-border border-t p-4">
        <Link
          href="/"
          className="text-destructive hover:bg-destructive/10 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
        >
          <LogOut size={20} />
          Sair
        </Link>
      </div>
    </aside>
  );
}
