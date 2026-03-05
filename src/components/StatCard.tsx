import { type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
  <motion.div
    whileHover={{ y: -3, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
    transition={{ type: "spring", stiffness: 300 }}
    className="stat-card rounded-xl"
  >
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorMap[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    {trend && <p className="mt-1 text-xs text-muted-foreground">{trend}</p>}
  </motion.div>
);

export default StatCard;
