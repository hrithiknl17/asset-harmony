import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: "primary" | "secondary" | "success" | "warning" | "destructive";
}

const colorMap = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

const StatCard = ({ label, value, icon: Icon, trend, color = "primary" }: StatCardProps) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
  </div>
);

export default StatCard;
