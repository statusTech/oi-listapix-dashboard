import { Ban, LayoutDashboard, ScrollText, type LucideIcon } from "lucide-react";
import type { Role } from "@/context/AuthContext";

export interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  roles: Role[];
  list?: { title: string; path: string; hide?: boolean }[];
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Home", path: "/", icon: LayoutDashboard, roles: ["master"] },
  { title: "Lista Negra", path: "/lista-negra", icon: Ban, roles: ["master"] },
  {
    title: "Logs",
    path: "/logs",
    icon: ScrollText,
    roles: ["master"],
    list: [
      { title: "Ingressos", path: "/logs/ingressos" },
      { title: "Split", path: "/logs/split" },
    ],
  },
];
