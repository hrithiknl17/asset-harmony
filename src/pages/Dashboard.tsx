import SalesDashboard from "@/pages/SalesDashboard";
import { Package, Monitor, CheckCircle2, AlertTriangle, Clock, MapPin, Activity, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import { CATEGORIES } from "@/data/assets";
import { Badge } from "@/components/ui/badge";
import { useAssets, useAuditLogs } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { sampleAssets } from "@/data/assets";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(142, 60%, 40%)",
  "hsl(270, 60%, 50%)",
  "hsl(200, 70%, 50%)",
];

const Dashboard = () => {
  const { data: assets, isLoading } = useAssets();
  const { data: logs } = useAuditLogs();
  const { profile, role } = useAuth();

  if (role === "sales") {
    return <SalesDashboard />;
  }

  const displayAssets = assets && assets.length > 0 ? assets : sampleAssets.map(a => ({
    ...a, asset_id: a.assetId, serial_number: a.serialNumber, purchase_date: a.purchaseDate,
    audit_status: a.auditStatus, last_audit_date: a.lastAuditDate, last_audited_by: null,
    created_at: "", updated_at: "",
  }));

  const total = displayAssets.length;
  const verified = displayAssets.filter(a => a.audit_status === "Verified").length;
  const pending = displayAssets.filter(a => a.audit_status === "Pending").length;
  const discrepancies = displayAssets.filter(a => a.audit_status === "Discrepancy").length;
  const auditRate = total > 0 ? Math.round((verified / total) * 100) : 0;

  const byCategory = CATEGORIES.map(cat => ({
    name: cat.replace("Equipment", "Eq.").replace("Decorations", "Decor.").replace("Entertainment", "Ent."),
    count: displayAssets.filter(a => a.category === cat).length,
  })).filter(c => c.count > 0);

  const byCondition = ["New", "Good", "Fair", "Poor", "Decommissioned"].map(c => ({
    name: c,
    value: displayAssets.filter(a => a.condition === c).length,
  })).filter(c => c.value > 0);

  const byStatus = [
    { name: "Verified", value: verified },
    { name: "Pending", value: pending },
    { name: "Discrepancy", value: discrepancies },
  ].filter(s => s.value > 0);

  const STATUS_COLORS = ["hsl(142, 60%, 40%)", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)"];

  const recentAssets = [...displayAssets].sort((a, b) => (b.purchase_date || "").localeCompare(a.purchase_date || "")).slice(0, 5);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {profile?.full_name || "User"} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {role === "auditor" ? "Your audit dashboard" : "Office asset inventory overview"}
        </p>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Assets" value={total} icon={Package} color="primary" trend="Across all locations" />
        <StatCard label="Verified" value={verified} icon={CheckCircle2} color="success" trend={`${auditRate}% of total`} />
        <StatCard label="Pending Audit" value={pending} icon={Clock} color="warning" trend="Awaiting verification" />
        <StatCard label="Discrepancies" value={discrepancies} icon={AlertTriangle} color="destructive" trend="Requires attention" />
      </motion.div>

      {/* Audit Progress Bar */}
      <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" /> Audit Progress
          </h2>
          <span className="text-2xl font-bold text-primary">{auditRate}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${auditRate}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{verified} verified</span>
          <span>{pending} pending</span>
          <span>{discrepancies} discrepancies</span>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Assets by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Condition Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCondition} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {byCondition.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Audit Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {byStatus.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Assets & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" /> Recently Added Assets
          </h2>
          <div className="space-y-2">
            {recentAssets.map((asset, i) => (
              <motion.div
                key={asset.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset.asset_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={asset.audit_status === "Verified" ? "default" : asset.audit_status === "Pending" ? "secondary" : "destructive"} className="text-xs">
                    {asset.audit_status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {asset.building}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          {logs && logs.length > 0 && (
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-secondary" /> Recent Activity
              </h2>
              <div className="space-y-2">
                {logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="text-xs border-l-2 border-secondary/30 pl-3 py-1">
                    <p className="font-medium">{log.new_status}</p>
                    <p className="text-muted-foreground">{(log.profiles as any)?.full_name || "Unknown"} • {new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Buildings</span>
                <span className="font-medium">{new Set(displayAssets.map(a => a.building)).size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Departments</span>
                <span className="font-medium">{new Set(displayAssets.map(a => a.department)).size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendors</span>
                <span className="font-medium">{new Set(displayAssets.map(a => a.vendor)).size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Categories</span>
                <span className="font-medium">{new Set(displayAssets.map(a => a.category)).size}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;