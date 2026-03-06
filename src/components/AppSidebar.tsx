import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ClipboardList, PlusCircle, FolderTree, ScanSearch, BarChart3, Package, LogOut, User, ShoppingCart, Camera, PackageCheck, Receipt, TrendingUp, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "manager", "auditor", "sales"] },
  { to: "/products", icon: Package, label: "Products", roles: ["admin", "manager"] },
  { to: "/stock-check", icon: PackageCheck, label: "Stock Check", roles: ["admin", "manager", "sales"] },
  { to: "/sales", icon: ShoppingCart, label: "Sales", roles: ["admin", "manager", "sales"] },
  { to: "/sales-report", icon: TrendingUp, label: "Sales Report", roles: ["admin", "manager"] },
  { to: "/register", icon: ClipboardList, label: "Asset Register", roles: ["admin", "manager", "auditor"] },
  { to: "/add-asset", icon: PlusCircle, label: "Add Asset", roles: ["admin", "manager"] },
  { to: "/categories", icon: FolderTree, label: "Categories", roles: ["admin", "manager", "auditor"] },
  { to: "/audit", icon: ScanSearch, label: "Audit Workflow", roles: ["admin", "manager", "auditor"] },
  { to: "/audit/scan", icon: Camera, label: "Scan & Audit", roles: ["admin", "manager", "auditor"] },
  { to: "/reports", icon: BarChart3, label: "Reports", roles: ["admin", "manager"] },
  { to: "/reorder", icon: Receipt, label: "Reorder Items", roles: ["admin", "manager"] },
];

const AppSidebar = () => {
  const location = useLocation();
  const { profile, role, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter(item => !role || item.roles.includes(role));

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <Package className="h-6 w-6 text-sidebar-primary shrink-0" />
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">AssetTrack</h1>
          <p className="text-[10px] text-sidebar-foreground/50 truncate">Inventory Manager</p>
        </div>
        <button
          className="ml-auto lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors ${
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/65 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-3 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sidebar-accent shrink-0">
            <User className="h-3.5 w-3.5 text-sidebar-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{profile?.full_name || "User"}</p>
            <p className="text-[10px] text-sidebar-foreground/45 capitalize">{role || "—"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-sidebar-foreground/55 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 h-8 text-xs"
          onClick={logout}
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="fixed top-3 left-3 z-50 lg:hidden flex h-9 w-9 items-center justify-center rounded-md bg-card border shadow-sm"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-56 flex-col bg-sidebar transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default AppSidebar;
