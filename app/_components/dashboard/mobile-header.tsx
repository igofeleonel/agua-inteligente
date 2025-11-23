import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sidebar } from "./sidebar";

export function MobileHeader() {
  return (
    <header className="bg-sidebar border-sidebar-border text-foreground flex items-center justify-between border-b p-4 md:hidden">
      <div className="text-lg font-bold">Água Inteligente</div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="border-r-sidebar-border bg-sidebar text-sidebar-foreground w-64 p-0"
        >
          <Sidebar />
        </SheetContent>
      </Sheet>
    </header>
  );
}
