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
import { Search, Mail, CreditCard, ShoppingCart, AlertTriangle, Package } from "lucide-react";

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
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(i => i.id)));
    }
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
      setProcessing(false);
      setEmailDialog(false);
      setSelected(new Set());
      toast.success("Order request emails sent to vendors!", { description: `${selectedItems.length} items requested from ${new Set(selectedItems.map(i => i.vendor)).size} vendor(s).` });
    }, 1500);
  };

  const handlePayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setPaymentDialog(false);
      setSelected(new Set());
      toast.success("Payment processed successfully!", { description: `$${totalCost.toFixed(2)} charged. Items will be delivered within 3-5 business days.` });
    }, 2000);
  };

  const openEmailDialog = () => {
    const vendorGroups = selectedItems.reduce((acc, item) => {
      if (!acc[item.vendor]) acc[item.vendor] = [];
      acc[item.vendor].push(item);
      return acc;
    }, {} as Record<string, ReorderItem[]>);

    const msg = Object.entries(vendorGroups).map(([vendor, items]) =>
      `To: ${items[0].vendorEmail}\nSubject: Reorder Request – AssetTrack\n\nDear ${vendor},\n\nWe would like to place an order for:\n${items.map(i => `• ${i.name} – Qty: ${getQty(i.id, i)}`).join("\n")}\n\nPlease confirm availability and delivery timeline.\n\nRegards,\nAssetTrack Manager`
    ).join("\n\n---\n\n");
    setEmailMessage(msg);
    setEmailDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reorder Items</h1>
          <p className="text-sm text-muted-foreground">Select low-stock party & event items to reorder via email or purchase</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" disabled={selected.size === 0} onClick={openEmailDialog}>
            <Mail className="h-4 w-4" /> Email Supplier
          </Button>
          <Button size="sm" className="gap-2" disabled={selected.size === 0} onClick={() => setPaymentDialog(true)}>
            <CreditCard className="h-4 w-4" /> Buy Now
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-4 rounded-lg border bg-accent/10 px-4 py-3">
          <ShoppingCart className="h-5 w-5 text-accent" />
          <span className="text-sm font-medium">{selected.size} item(s) selected</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm font-semibold">Total: ${totalCost.toFixed(2)}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search items..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Party Categories</SelectItem>
            {partyCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left">
                <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={selectAll} />
              </th>
              {["Item", "Category", "Vendor", "Unit Price", "Stock", "Status", "Order Qty"].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const status = stockStatus(item);
              const isSelected = selected.has(item.id);
              return (
                <tr key={item.id} className={`border-b last:border-0 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                  <td className="px-4 py-3">
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{item.vendor}</td>
                  <td className="px-4 py-3 font-medium">${item.unitPrice.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs">{item.currentStock} / {item.minStock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={status.variant} className="text-xs gap-1">
                      {item.currentStock === 0 && <AlertTriangle className="h-3 w-3" />}
                      {status.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      min={1}
                      className="w-16 h-8 text-center text-xs"
                      value={getQty(item.id, item)}
                      onChange={e => setQty(item.id, parseInt(e.target.value) || 1)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No items found.</p>}
      </div>

      {/* Email Dialog */}
      <Dialog open={emailDialog} onOpenChange={setEmailDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Email Order Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The following email(s) will be sent to {new Set(selectedItems.map(i => i.vendor)).size} vendor(s):
            </p>
            <Textarea value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={12} className="font-mono text-xs" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialog(false)}>Cancel</Button>
            <Button onClick={handleEmailSend} disabled={processing} className="gap-2">
              {processing ? "Sending..." : <><Mail className="h-4 w-4" /> Send Emails</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              {selectedItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {getQty(item.id, item)}</span>
                  <span className="font-medium">${(item.unitPrice * getQty(item.id, item)).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input id="cardName" placeholder="Sarah Mitchell" defaultValue="Sarah Mitchell" />
              </div>
              <div>
                <Label htmlFor="cardNum">Card Number</Label>
                <Input id="cardNum" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input id="expiry" placeholder="12/28" defaultValue="12/28" />
                </div>
                <div className="w-24">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" defaultValue="123" />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> Demo mode – no real charges will be made
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>Cancel</Button>
            <Button onClick={handlePayment} disabled={processing} className="gap-2">
              {processing ? "Processing..." : <><CreditCard className="h-4 w-4" /> Pay ${totalCost.toFixed(2)}</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reorder;
