import { useState } from "react";
import { reorderCatalog, CATEGORIES, type ReorderItem } from "@/data/assets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Mail, CreditCard, ShoppingCart, AlertTriangle, Package, Receipt } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";

const partyCategories = ["Party Decorations", "Catering Equipment", "AV & Entertainment"] as const;

const Reorder = () => {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [emailDialog, setEmailDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const filtered = reorderCatalog.filter(item => {
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || item.category === catFilter;
    return matchSearch && matchCat;
  });

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

  const getQty = (id: string, item: ReorderItem) => quantities[id] ?? Math.max(item.minStock - item.currentStock, 1);
  const setQty = (id: string, val: number) => setQuantities(prev => ({ ...prev, [id]: Math.max(1, val) }));

  const selectedItems = reorderCatalog.filter(i => selected.has(i.id));
  const totalCost = selectedItems.reduce((sum, i) => sum + i.unitPrice * getQty(i.id, i), 0);

  const stockStatus = (item: ReorderItem) => {
    if (item.currentStock === 0) return { label: "Out of Stock", variant: "destructive" as const };
    if (item.currentStock < item.minStock) return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  const handleEmailSend = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false); setEmailDialog(false); setSelected(new Set());
      toast.success("Order request emails sent to vendors!", { description: `${selectedItems.length} items requested.` });
    }, 1500);
  };

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false); setPaymentDialog(false); setSelected(new Set());
      toast.success("Payment processed successfully!", { description: `$${totalCost.toFixed(2)} charged.` });
    }, 2000);
  };

  const openEmailDialog = () => {
    const vendorGroups = selectedItems.reduce((acc, item) => {
      if (!acc[item.vendor]) acc[item.vendor] = [];
      acc[item.vendor].push(item);
      return acc;
    }, {} as Record<string, ReorderItem[]>);

    const msg = Object.entries(vendorGroups).map(([vendor, items]) =>
      `To: ${items[0].vendorEmail}\nSubject: Reorder Request\n\nDear ${vendor},\n\nWe would like to order:\n${items.map(i => `- ${i.name} x ${getQty(i.id, i)}`).join("\n")}\n\nPlease confirm.\n\nRegards,\nAssetTrack`
    ).join("\n\n---\n\n");
    setEmailMessage(msg);
    setEmailDialog(true);
  };

  return (
    <PageShell
      icon={Receipt}
      title="Reorder Items"
      subtitle="Select low-stock items to reorder via email or purchase"
      actions={
        <>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={selected.size === 0} onClick={openEmailDialog}>
            <Mail className="h-3.5 w-3.5" /> Email Supplier
          </Button>
          <Button size="sm" className="gap-1.5" disabled={selected.size === 0} onClick={() => setPaymentDialog(true)}>
            <CreditCard className="h-3.5 w-3.5" /> Buy Now
          </Button>
        </>
      }
      filters={
        <>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-9 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[180px] h-9 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {partyCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </>
      }
    >
      {/* Selection summary */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border bg-primary/5 px-4 py-2.5 text-sm">
          <ShoppingCart className="h-4 w-4 text-primary" />
          <span className="font-medium">{selected.size} item(s) selected</span>
          <span className="text-muted-foreground">&middot;</span>
          <span className="font-semibold">Total: ${totalCost.toFixed(2)}</span>
        </div>
      )}

      <div className="data-table-wrapper overflow-auto">
        <table className="w-full text-sm table-sticky-header table-zebra">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2.5 text-left">
                <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
              </th>
              {["Item", "Category", "Vendor", "Unit Price", "Stock", "Status", "Order Qty"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const status = stockStatus(item);
              const isSelected = selected.has(item.id);
              return (
                <tr key={item.id} className={`border-b last:border-0 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                  <td className="px-3 py-2.5"><Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} /></td>
                  <td className="px-3 py-2.5 font-medium text-sm">{item.name}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{item.category}</td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">{item.vendor}</td>
                  <td className="px-3 py-2.5 font-medium tabular-nums">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums">{item.currentStock} / {item.minStock}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant={status.variant} className="text-[10px] gap-0.5">
                      {item.currentStock === 0 && <AlertTriangle className="h-2.5 w-2.5" />}
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Input type="number" min={1} className="w-16 h-7 text-center text-xs" value={getQty(item.id, item)} onChange={e => setQty(item.id, parseInt(e.target.value) || 1)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon={Package} title="No items found" />}
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email Order Request</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Emails will be sent to {new Set(selectedItems.map(i => i.vendor)).size} vendor(s):</p>
            <Textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={10} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleEmailSend} disabled={processing}>{processing ? "Sending..." : "Send Emails"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> Checkout</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-1.5">
              {selectedItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {getQty(item.id, item)}</span>
                  <span className="font-medium tabular-nums">${(item.unitPrice * getQty(item.id, item)).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-1.5 flex justify-between font-bold text-sm">
                <span>Total</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Cardholder Name</Label><Input defaultValue="Sarah Mitchell" /></div>
              <div className="space-y-1.5"><Label>Card Number</Label><Input defaultValue="4242 4242 4242 4242" /></div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5"><Label>Expiry</Label><Input defaultValue="12/28" /></div>
                <div className="w-24 space-y-1.5"><Label>CVC</Label><Input defaultValue="123" /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> Demo mode — no real charges
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={processing}>{processing ? "Processing..." : `Pay $${totalCost.toFixed(2)}`}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default Reorder;
