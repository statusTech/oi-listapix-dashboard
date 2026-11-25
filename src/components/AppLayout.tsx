import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth, type Role } from "../context/AuthContext";
import { cn } from "@/lib/utils";

interface NavLeaf {
  label: string;
  to: string;
}

interface NavItem {
  label: string;
  roles: Role[];
  to?: string;
  end?: boolean;
  children?: NavLeaf[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", to: "/", end: true, roles: ["master"] },
  { label: "Lista Negra", to: "/lista-negra", roles: ["master"] },
  {
    label: "Logs",
    roles: ["master"],
    children: [
      { label: "Ingressos", to: "/logs/ingressos" },
      { label: "Split", to: "/logs/split" },
    ],
  },
];

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  cn(
    "block rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
    isActive ? "bg-primary text-primary-foreground" : "text-neutral-600 hover:bg-accent",
  );

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const children = item.children ?? [];
  const active = children.some((child) => pathname.startsWith(child.to));
  const [open, setOpen] = useState(false);

  // Fecha o submenu ao navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          active ? "bg-primary text-primary-foreground" : "text-neutral-600 hover:bg-accent",
        )}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-1 pl-3 md:absolute md:left-0 md:top-full md:z-10 md:min-w-40 md:rounded-md md:border md:border-border md:bg-background md:p-1 md:pl-1 md:shadow-md">
          {children.map((child) => (
            <NavLink key={child.to} to={child.to} className={linkClassName}>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const { logout, role } = useAuth();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const items = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

  return (
    <div className="min-h-screen">
      <div className="relative border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold">Lista Pix</h1>
            <nav
              className={cn(
                "flex-col gap-1 md:flex md:flex-row md:items-center",
                mobileOpen
                  ? "absolute inset-x-0 top-full z-20 flex border-b border-border bg-background p-4"
                  : "hidden",
              )}
            >
              {items.map((item) =>
                item.children ? (
                  <NavGroup key={item.label} item={item} pathname={pathname} />
                ) : (
                  <NavLink key={item.label} to={item.to!} end={item.end} className={linkClassName}>
                    {item.label}
                  </NavLink>
                ),
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={logout} variant="outline">
              Sair
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
