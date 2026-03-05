import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, PlusCircle, FolderTree, ScanSearch, BarChart3, Package, LogOut, User, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/register", icon: ClipboardList, label: "Asset Register" },
  { to: "/add-asset", icon: PlusCircle, label: "Add Asset" },
  { to: "/categories", icon: FolderTree, label: "Categories" },
  { to: "/audit", icon: ScanSearch, label: "Audit Workflow" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
  { to: "/reorder", icon: ShoppingCart, label: "Reorder Items" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <Package className="h-7 w-7 text-sidebar-primary" />
        <div>
          <h1 className="text-base font-bold text-sidebar-foreground tracking-tight">AssetTrack</h1>
          <p className="text-[11px] text-sidebar-foreground/60">Office Asset Manager</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent">
            <User className="h-4 w-4 text-sidebar-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={logout}>
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;
