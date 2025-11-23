import type React from "react";
// import { Sidebar } from "../_components/dashboard/sidebar";

import { MobileHeader } from "../_components/dashboard/mobile-header";
import { Sidebar } from "../_components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="text-foreground bg-background flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
