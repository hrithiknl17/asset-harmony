import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { sampleAssets, CATEGORIES, CONDITIONS, type Asset } from "@/data/assets";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, QrCode, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const statusColor = (s: string) =>
  s === "Verified" ? "default" : s === "Pending" ? "secondary" : "destructive";

const conditionColor = (c: string) => {
  if (c === "New") return "text-emerald-600";
  if (c === "Good") return "text-blue-600";
  if (c === "Fair") return "text-amber-600";
  return "text-destructive";
};

const AUDIT_STATUSES = ["Verified", "Pending", "Discrepancy"];
const BUILDINGS = [...new Set(sampleAssets.map(a => a.building))];
const DEPARTMENTS = [...new Set(sampleAssets.map(a => a.department))];

const exportCSV = (data: Asset[]) => {
  const headers = ["Asset ID", "Name", "Category", "Location", "Vendor", "Model", "Serial Number", "Purchase Date", "Condition", "Audit Status", "Last Audit Date"];
  const rows = data.map(a => [a.assetId, a.name, a.category, a.location, a.vendor, a.model, a.serialNumber, a.purchaseDate, a.condition, a.auditStatus, a.lastAuditDate]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `asset-register-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("CSV exported successfully!");
};

const AssetRegister = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [condFilter, setCondFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [buildingFilter, setBuildingFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat) setCatFilter(cat);
    if (q) setSearch(q);
  }, [searchParams]);

  const hasActiveFilters = catFilter !== "all" || condFilter !== "all" || statusFilter !== "all" || buildingFilter !== "all" || deptFilter !== "all" || search !== "";

  const clearFilters = () => {
    setSearch("");
    setCatFilter("all");
    setCondFilter("all");
    setStatusFilter("all");
    setBuildingFilter("all");
    setDeptFilter("all");
  };

  const filtered = useMemo(() => sampleAssets.filter(a => {
    const s = search.toLowerCase();
    const matchSearch = !search || a.name.toLowerCase().includes(s) || a.assetId.toLowerCase().includes(s) || a.serialNumber.toLowerCase().includes(s) || a.vendor.toLowerCase().includes(s);
    const matchCat = catFilter === "all" || a.category === catFilter;
    const matchCond = condFilter === "all" || a.condition === condFilter;
    const matchStatus = statusFilter === "all" || a.auditStatus === statusFilter;
    const matchBuilding = buildingFilter === "all" || a.building === buildingFilter;
    const matchDept = deptFilter === "all" || a.department === deptFilter;
    return matchSearch && matchCat && matchCond && matchStatus && matchBuilding && matchDept;
  }), [search, catFilter, condFilter, statusFilter, buildingFilter, deptFilter]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Register</h1>
          <p className="text-sm text-muted-foreground">Master inventory of all office assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => exportCSV(filtered)}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, ID, serial, or vendor..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={condFilter} onValueChange={setCondFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {AUDIT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={buildingFilter} onValueChange={setBuildingFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue placeholder="Building" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buildings</SelectItem>
              {BUILDINGS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Depts</SelectItem>
              {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs text-muted-foreground" onClick={clearFilters}>
              <X className="h-3 w-3" /> Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {["Asset ID", "Name", "Category", "Location", "Vendor", "Model / Serial", "Purchased", "Condition", "Status", "QR"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => (
              <motion.tr
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs font-medium">{a.assetId}</td>
                <td className="px-4 py-3 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{a.location}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.vendor}</td>
                <td className="px-4 py-3">
                  <div className="text-xs">{a.model}</div>
                  <div className="text-xs text-muted-foreground font-mono">{a.serialNumber}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{a.purchaseDate}</td>
                <td className={`px-4 py-3 text-xs font-medium ${conditionColor(a.condition)}`}>{a.condition}</td>
                <td className="px-4 py-3"><Badge variant={statusColor(a.auditStatus)} className="text-xs">{a.auditStatus}</Badge></td>
                <td className="px-4 py-3">
                  <button onClick={() => setQrAsset(a)} className="rounded p-1 hover:bg-muted transition-colors">
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No assets found matching filters.</p>}
      </div>

      <p className="text-xs text-muted-foreground">Showing {filtered.length} of {sampleAssets.length} assets</p>

      <Dialog open={!!qrAsset} onOpenChange={() => setQrAsset(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asset QR Code</DialogTitle>
          </DialogHeader>
          {qrAsset && (
            <div className="flex flex-col items-center gap-4 py-4">
              <QRCodeSVG value={JSON.stringify({ assetId: qrAsset.assetId, name: qrAsset.name, serial: qrAsset.serialNumber, location: qrAsset.location })} size={200} />
              <div className="text-center">
                <p className="font-mono text-sm font-bold">{qrAsset.assetId}</p>
                <p className="text-sm">{qrAsset.name}</p>
                <p className="text-xs text-muted-foreground">{qrAsset.location}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AssetRegister;