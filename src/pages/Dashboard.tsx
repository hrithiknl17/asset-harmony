import SalesDashboard from "@/pages/SalesDashboard";
import AuditorDashboard from "@/pages/AuditorDashboard";
import { Package, Monitor, CheckCircle2, AlertTriangle, Clock, MapPin, TrendingUp, Activity } from "lucide-react";
import StatCard from "@/components/StatCard";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES } from "@/data/assets";
import { Badge } from "@/components/ui/badge";
import { useAssets, useAuditLogs } from "@/hooks/useAssets";
import { useAuth } from "@/contexts/AuthContext";
import { sampleAssets } from "@/data/assets";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const CHART_COLORS = [
  "hsl(222, 62%, 32%)",
  "hsl(170, 45%, 42%)",
  "hsl(38, 88%, 48%)",
  "hsl(0, 68%, 48%)",
  "hsl(152, 52%, 38%)",
  "hsl(270, 55%, 48%)",
  "hsl(200, 65%, 48%)",
  "hsl(320, 50%, 45%)",
];

const Dashboard = () => {
  const { data: assets } = useAssets();
  const { data: logs } = useAuditLogs();
  const { profile, role } = useAuth();

  if (role === "sales") return <SalesDashboard />;
  if (role === "auditor") return <AuditorDashboard />;

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

  const STATUS_COLORS = ["hsl(152, 52%, 38%)", "hsl(38, 88%, 48%)", "hsl(0, 68%, 48%)"];

  const recentAssets = [...displayAssets].sort((a, b) => (b.purchase_date || "").localeCompare(a.purchase_date || "")).slice(0, 5);

  return (
    <PageShell
      title={`Welcome back, ${profile?.full_name || "User"}`}
      subtitle="Office asset inventory overview"
    >
      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Assets" value={total} icon={Package} color="primary" trend="Across all locations" />
        <StatCard label="Verified" value={verified} icon={CheckCircle2} color="success" trend={`${auditRate}% of total`} />
        <StatCard label="Pending Audit" value={pending} icon={Clock} color="warning" trend="Awaiting verification" />
        <StatCard label="Discrepancies" value={discrepancies} icon={AlertTriangle} color="destructive" trend="Requires attention" />
      </div>

      {/* Audit Progress */}
      <div className="section-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Audit Progress
          </h2>
          <span className="text-lg font-bold text-primary">{auditRate}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-1000"
            style={{ width: `${auditRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{verified} verified</span>
          <span>{pending} pending</span>
          <span>{discrepancies} discrepancies</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="section-card">
          <h2 className="section-title mb-4">Assets by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCategory} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220, 14%, 89%)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(222, 62%, 32%)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card">
          <h2 className="section-title mb-4">Condition Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byCondition} cx="50%" cy="50%" innerRadius={40} outerRadius={72} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {byCondition.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card">
          <h2 className="section-title mb-4">Audit Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={byStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={72} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                {byStatus.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Assets & Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 section-card">
          <h2 className="section-title mb-4 flex items-center gap-1.5">
            <Monitor className="h-3.5 w-3.5 text-primary" /> Recently Added Assets
          </h2>
          <div className="space-y-1.5">
            {recentAssets.map((asset, i) => (
              <div
                key={asset.id || i}
                className="flex items-center justify-between rounded-md border px-3 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
                    <Monitor className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset.asset_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={asset.audit_status === "Verified" ? "default" : asset.audit_status === "Pending" ? "secondary" : "destructive"} className="text-[10px]">
                    {asset.audit_status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground hidden sm:flex items-center gap-0.5">
                    <MapPin className="h-2.5 w-2.5" /> {asset.building}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {logs && logs.length > 0 && (
            <div className="section-card">
              <h2 className="section-title mb-3 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-secondary" /> Recent Activity
              </h2>
              <div className="space-y-2">
                {logs.slice(0, 5).map((log: any) => (
                  <div key={log.id} className="text-xs border-l-2 border-secondary/30 pl-2.5 py-0.5">
                    <p className="font-medium">{log.new_status}</p>
                    <p className="text-muted-foreground">{(log.profiles as any)?.full_name || "Unknown"} &middot; {new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-card">
            <h2 className="section-title mb-3">Quick Stats</h2>
            <div className="space-y-2.5">
              {[
                { label: "Buildings", value: new Set(displayAssets.map(a => a.building)).size },
                { label: "Departments", value: new Set(displayAssets.map(a => a.department)).size },
                { label: "Vendors", value: new Set(displayAssets.map(a => a.vendor)).size },
                { label: "Categories", value: new Set(displayAssets.map(a => a.category)).size },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Dashboard;
