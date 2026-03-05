import { useState } from "react";
import { sampleAssets, CATEGORIES, CONDITIONS, type Asset } from "@/data/assets";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

const statusColor = (s: string) =>
  s === "Verified" ? "default" : s === "Pending" ? "secondary" : "destructive";

const conditionColor = (c: string) => {
  if (c === "New") return "text-success";
  if (c === "Good") return "text-info";
  if (c === "Fair") return "text-warning";
  return "text-destructive";
};

const AssetRegister = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [condFilter, setCondFilter] = useState<string>("all");
  const [qrAsset, setQrAsset] = useState<Asset | null>(null);

  const filtered = sampleAssets.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.assetId.toLowerCase().includes(search.toLowerCase()) || a.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || a.category === catFilter;
    const matchCond = condFilter === "all" || a.condition === condFilter;
    return matchSearch && matchCat && matchCond;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Register</h1>
          <p className="text-sm text-muted-foreground">Master inventory of all office assets</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, ID, or serial..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={condFilter} onValueChange={setCondFilter}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

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
            {filtered.map(a => (
              <tr key={a.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
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
              </tr>
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
    </div>
  );
};

export default AssetRegister;
