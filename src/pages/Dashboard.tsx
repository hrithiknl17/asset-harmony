import { Package, Monitor, CheckCircle2, AlertTriangle, Clock, MapPin, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import { CATEGORIES } from "@/data/assets";
import { Badge } from "@/components/ui/badge";
import { useAssets, useAuditLogs } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { sampleAssets } from "@/data/assets";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Dashboard = () => {
  const { data: assets, isLoading } = useAssets();
  const { data: logs } = useAuditLogs();
  const { profile, role } = useAuth();

  // Use DB assets if available, fallback to sample
  const displayAssets = assets && assets.length > 0 ? assets : sampleAssets.map(a => ({
    ...a, asset_id: a.assetId, serial_number: a.serialNumber, purchase_date: a.purchaseDate,
    audit_status: a.auditStatus, last_audit_date: a.lastAuditDate, last_audited_by: null,
    created_at: "", updated_at: "",
  }));

  const total = displayAssets.length;
  const verified = displayAssets.filter(a => a.audit_status === "Verified").length;
  const pending = displayAssets.filter(a => a.audit_status === "Pending").length;
  const discrepancies = displayAssets.filter(a => a.audit_status === "Discrepancy").length;

  const byCategory = CATEGORIES.map(cat => ({
    name: cat,
    count: displayAssets.filter(a => a.category === cat).length,
  })).filter(c => c.count > 0);

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
        <StatCard label="Verified" value={verified} icon={CheckCircle2} color="success" trend={total > 0 ? `${Math.round(verified / total * 100)}% of total` : "—"} />
        <StatCard label="Pending Audit" value={pending} icon={Clock} color="warning" trend="Awaiting verification" />
        <StatCard label="Discrepancies" value={discrepancies} icon={AlertTriangle} color="destructive" trend="Requires attention" />
      </motion.div>

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
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">By Category</h2>
            <div className="space-y-3">
              {byCategory.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-sm truncate pr-2">{cat.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-secondary/20 w-20">
                      <motion.div
                        className="h-2 rounded-full bg-secondary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.count / total) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                      />
                    </div>
                    <span className="text-sm font-mono font-medium w-6 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
