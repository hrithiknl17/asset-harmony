import { useAssets, useAuditLogs } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Clock, AlertTriangle, CheckCircle2, ScanLine, Camera, MapPin, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { sampleAssets } from "@/data/assets";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const STATUS_COLORS: Record<string, string> = {
  Verified: "hsl(142, 60%, 40%)",
  Pending: "hsl(38, 92%, 50%)",
  Discrepancy: "hsl(0, 72%, 51%)",
};

const AuditorDashboard = () => {
  const { data: assets } = useAssets();
  const { data: logs } = useAuditLogs();
  const { profile, user } = useAuth();
  const navigate = useNavigate();

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

  // My audits (logs by current user)
  const myLogs = logs?.filter((l: any) => l.auditor_id === user?.id) || [];
  const myVerified = myLogs.filter((l: any) => l.new_status === "Verified").length;
  const myDiscrepancies = myLogs.filter((l: any) => l.new_status === "Discrepancy").length;

  // Pending assets to audit (prioritized)
  const pendingAssets = displayAssets
    .filter(a => a.audit_status === "Pending" || a.audit_status === "Discrepancy")
    .slice(0, 8);

  // Status pie
  const statusData = [
    { name: "Verified", value: verified },
    { name: "Pending", value: pending },
    { name: "Discrepancy", value: discrepancies },
  ].filter(s => s.value > 0);

  // Recent activity
  const recentLogs = logs?.slice(0, 6) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" /> Auditor Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {profile?.full_name || "Auditor"} — {pending} assets awaiting verification
          </p>
        </div>
        <Button onClick={() => navigate("/audit-scan")} className="gap-2">
          <ScanLine className="h-4 w-4" /> Start Scanning
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Audits"
          value={pending}
          icon={Clock}
          color="warning"
          trend={`${discrepancies} discrepancies`}
        />
        <StatCard
          label="Verified Today"
          value={myVerified}
          icon={CheckCircle2}
          color="success"
          trend={`${myLogs.length} total scans by you`}
        />
        <StatCard
          label="Discrepancies Found"
          value={myDiscrepancies}
          icon={AlertTriangle}
          color="destructive"
          trend="Flagged for review"
        />
        <StatCard
          label="Audit Progress"
          value={`${auditRate}%`}
          icon={ClipboardCheck}
          color="primary"
          trend={`${verified} of ${total} verified`}
        />
      </motion.div>

      {/* Progress Bar */}
      <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Overall Audit Progress</h2>
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
          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success" /> {verified} verified</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-warning" /> {pending} pending</span>
          <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-destructive" /> {discrepancies} discrepancies</span>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Assets Queue */}
        <motion.div variants={item} className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" /> Assets to Audit
          </h2>
          {pendingAssets.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-success/50" />
              All assets have been audited! 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {pendingAssets.map((asset, i) => (
                <motion.div
                  key={asset.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center justify-between rounded-lg border px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => navigate("/audit-scan")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      asset.audit_status === "Discrepancy" ? "bg-destructive/10" : "bg-warning/10"
                    }`}>
                      {asset.audit_status === "Discrepancy" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <Clock className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{asset.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{asset.asset_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={asset.audit_status === "Discrepancy" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {asset.audit_status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {asset.building || asset.location}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right column */}
        <motion.div variants={item} className="space-y-6">
          {/* Audit Status Pie */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-4">Audit Status</h2>
            {statusData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No data</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {statusData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-secondary" /> Recent Activity
            </h2>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No audit activity yet</p>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="text-xs border-l-2 border-secondary/30 pl-3 py-1">
                    <p className="font-medium flex items-center gap-1">
                      {log.new_status === "Verified" && <CheckCircle2 className="h-3 w-3 text-success" />}
                      {log.new_status === "Discrepancy" && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      {log.new_status}
                    </p>
                    <p className="text-muted-foreground">
                      {(log.profiles as any)?.full_name || "Unknown"} • {new Date(log.created_at).toLocaleDateString()}
                    </p>
                    {log.notes && <p className="text-muted-foreground italic mt-0.5">"{log.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuditorDashboard;
