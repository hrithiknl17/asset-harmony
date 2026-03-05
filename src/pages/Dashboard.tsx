import { Package, Monitor, CheckCircle2, AlertTriangle, Clock, MapPin } from "lucide-react";
import StatCard from "@/components/StatCard";
import { sampleAssets, CATEGORIES } from "@/data/assets";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const total = sampleAssets.length;
  const verified = sampleAssets.filter(a => a.auditStatus === "Verified").length;
  const pending = sampleAssets.filter(a => a.auditStatus === "Pending").length;
  const discrepancies = sampleAssets.filter(a => a.auditStatus === "Discrepancy").length;

  const byCategory = CATEGORIES.map(cat => ({
    name: cat,
    count: sampleAssets.filter(a => a.category === cat).length,
  })).filter(c => c.count > 0);

  const recentAssets = [...sampleAssets].sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Office asset inventory overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Assets" value={total} icon={Package} color="primary" trend="Across all locations" />
        <StatCard label="Verified" value={verified} icon={CheckCircle2} color="success" trend={`${Math.round(verified/total*100)}% of total`} />
        <StatCard label="Pending Audit" value={pending} icon={Clock} color="warning" trend="Awaiting verification" />
        <StatCard label="Discrepancies" value={discrepancies} icon={AlertTriangle} color="destructive" trend="Requires attention" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border bg-card p-5">
          <h2 className="text-base font-semibold mb-4">Recently Added Assets</h2>
          <div className="space-y-3">
            {recentAssets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                    <Monitor className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{asset.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{asset.assetId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={asset.auditStatus === "Verified" ? "default" : asset.auditStatus === "Pending" ? "secondary" : "destructive"} className="text-xs">
                    {asset.auditStatus}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {asset.building}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="text-base font-semibold mb-4">By Category</h2>
          <div className="space-y-3">
            {byCategory.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <span className="text-sm">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-secondary/20 w-24">
                    <div className="h-2 rounded-full bg-secondary" style={{ width: `${(cat.count / total) * 100}%` }} />
                  </div>
                  <span className="text-sm font-mono font-medium w-6 text-right">{cat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
