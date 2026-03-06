import { useState, useMemo } from "react";
import { useAssets } from "@/hooks/useAssets";
import { CATEGORIES } from "@/data/assets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Mail, ShoppingCart, AlertTriangle, Package, Receipt } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";

const Reorder = () => {
  const { data: assets, isLoading } = useAssets();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  // Assets that need attention: Poor/Fair condition or Discrepancy status
  const reorderableAssets = useMemo(() => {
    if (!assets) return [];
    return assets.filter(a => {
      const needsReorder =
        a.condition === "Poor" ||
        a.condition === "Fair" ||
        a.condition === "Decommissioned" ||
        a.audit_status === "Discrepancy";
      return needsReorder;
    });
  }, [assets]);

  const filtered = useMemo(() => {
    return reorderableAssets.filter(a => {
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.asset_id.toLowerCase().includes(search.toLowerCase()) ||
        a.vendor.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === "all" || a.category === catFilter;
      const matchCondition = conditionFilter === "all" || a.condition === conditionFilter;
      return matchSearch && matchCat && matchCondition;
    });
  }, [reorderableAssets, search, catFilter, conditionFilter]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(i => i.id)));
  };

  const selectedItems = filtered.filter(i => selected.has(i.id));

  const conditionBadge = (condition: string) => {
    switch (condition) {
      case "Decommissioned": return "destructive" as const;
      case "Poor": return "destructive" as const;
      case "Fair": return "secondary" as const;
      default: return "default" as const;
    }
  };

  const openEmailDialog = () => {
    const vendorGroups = selectedItems.reduce((acc, item) => {
      const vendor = item.vendor || "Unknown Vendor";
      if (!acc[vendor]) acc[vendor] = [];
      acc[vendor].push(item);
      return acc;
    }, {} as Record<string, typeof selectedItems>);

    const msg = Object.entries(vendorGroups)
      .map(
        ([vendor, items]) =>
          `To: ${vendor}\nSubject: Replacement/Reorder Request\n\nDear ${vendor},\n\nWe would like to request replacement/reorder for the following assets:\n${items
            .map(i => `- ${i.name} (${i.asset_id}) – Model: ${i.model}, S/N: ${i.serial_number}, Condition: ${i.condition}`)
            .join("\n")}\n\nPlease confirm availability and pricing.\n\nRegards,\nAssetTrack`
      )
      .join("\n\n---\n\n");
    setEmailMessage(msg);
    setEmailDialog(true);
  };

  const handleEmailSend = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setEmailDialog(false);
      setSelected(new Set());
      toast.success("Reorder request emails sent!", {
        description: `${selectedItems.length} asset(s) requested from ${new Set(selectedItems.map(i => i.vendor)).size} vendor(s).`,
      });
    }, 1500);
  };

  const activeCategories = useMemo(() => {
    return [...new Set(reorderableAssets.map(a => a.category))].sort();
  }, [reorderableAssets]);

  return (
    <PageShell
      icon={Receipt}
      title="Reorder Items"
      subtitle="Assets needing replacement or reorder based on condition and audit status"
      actions={
        <Button variant="outline" size="sm" className="gap-1.5" disabled={selected.size === 0} onClick={openEmailDialog}>
          <Mail className="h-3.5 w-3.5" /> Email Vendor
        </Button>
      }
      filters={
        <>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, ID, or vendor..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {activeCategories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
              <SelectItem value="Poor">Poor</SelectItem>
              <SelectItem value="Decommissioned">Decommissioned</SelectItem>
            </SelectContent>
          </Select>
        </>
      }
    >
      {/* Selection summary */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border bg-primary/5 px-4 py-2.5 text-sm">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="font-medium">{selected.size} asset(s) selected for reorder</span>
        </div>
      )}

      <div className="data-table-wrapper overflow-auto">
        {isLoading ? (
          <TableSkeleton rows={8} columns={7} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No assets need reordering" />
        ) : (
          <table className="w-full text-sm table-sticky-header table-zebra">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2.5 text-left">
                  <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
                </th>
                {["Asset ID", "Name", "Category", "Vendor", "Model", "Condition", "Audit Status", "Location"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const isSelected = selected.has(asset.id);
                return (
                  <tr
                    key={asset.id}
                    className={`border-b last:border-0 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}
                  >
                    <td className="px-3 py-2.5">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(asset.id)} />
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs">{asset.asset_id}</td>
                    <td className="px-3 py-2.5 font-medium">{asset.name}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.category}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.vendor || "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.model || "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={conditionBadge(asset.condition)} className="text-[10px] gap-0.5">
                        {(asset.condition === "Poor" || asset.condition === "Decommissioned") && (
                          <AlertTriangle className="h-2.5 w-2.5" />
                        )}
                        {asset.condition}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={asset.audit_status === "Discrepancy" ? "destructive" : asset.audit_status === "Pending" ? "secondary" : "default"}
                        className="text-[10px]"
                      >
                        {asset.audit_status}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{asset.building} – {asset.room}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Reorder Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Emails will be sent to {new Set(selectedItems.map(i => i.vendor)).size} vendor(s):
            </p>
            <Textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={10} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleEmailSend} disabled={processing}>
              {processing ? "Sending..." : "Send Emails"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Reorder;
