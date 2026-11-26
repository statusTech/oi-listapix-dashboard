import { useState, type CSSProperties } from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "./layout/AppSidebar";
import Navbar from "./layout/Navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem("sidebar:collapsed");
      return stored !== null ? stored !== "true" : true;
    } catch {
      return true;
    }
  });

  const handleSidebarChange = (open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem("sidebar:collapsed", open ? "false" : "true");
    } catch {
      // sem localStorage: segue sem persistir
    }
  };

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={handleSidebarChange}
      style={
        {
          "--sidebar-top": "0px",
          "--sidebar-width": "15rem",
          "--sidebar-width-icon": "4.5rem",
        } as CSSProperties
      }
      className="bg-[#0B0F19] min-h-screen"
    >
      <AppSidebar />

      <SidebarInset className="bg-oi-bg h-screen overflow-y-auto overflow-x-hidden md:rounded-tl-3xl shadow-2xl transition-[margin,border-radius] duration-300 ease-in-out">
        <Navbar />
        <div className="flex flex-col min-h-[calc(100vh-4rem)] p-5 bg-oi-bg">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
