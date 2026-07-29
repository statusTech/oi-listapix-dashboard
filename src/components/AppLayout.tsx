import { NavLink, Outlet } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { cn } from "@/lib/utils";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "bg-primary text-primary-foreground" : "text-neutral-600 hover:bg-accent",
  );

export function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-8 py-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Lista Pix</h1>
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={navLinkClassName}>
                Home
              </NavLink>
              <NavLink to="/lista-negra" className={navLinkClassName}>
                Lista Negra
              </NavLink>
            </nav>
          </div>
          <Button onClick={logout} variant="outline">
            Sair
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
