import { useState } from "react";
import { useProducts, useRecordSale, useSales } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, PlusCircle, Receipt, ArrowUpRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import SectionCard from "@/components/SectionCard";
import MetricCard from "@/components/MetricCard";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { useToast } from "@/hooks/use-toast";

const Sales = () => {
  const { data: products } = useProducts();
  const { data: sales, isLoading } = useSales();
  const recordSale = useRecordSale();
  const { role } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ productId: "", quantity: "1", customerName: "", notes: "" });

  const canSell = role === "admin" || role === "manager" || role === "sales";
  const selectedProduct = products?.find(p => p.id === form.productId);

  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + Number(s.total_price), 0) || 0;
  const totalTransactions = sales?.length || 0;

  const handleSale = async () => {
    try {
      await recordSale.mutateAsync({
        productId: form.productId,
        quantity: parseInt(form.quantity),
        unitPrice: selectedProduct!.price,
        customerName: form.customerName,
        notes: form.notes,
      });
      toast({ title: "Sale recorded!", description: `${selectedProduct!.name} × ${form.quantity}` });
      setOpen(false);
      setForm({ productId: "", quantity: "1", customerName: "", notes: "" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <PageShell
      icon={ShoppingCart}
      title="Sales"
      subtitle="Record and track product sales"
      actions={
        canSell ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5 font-semibold"><PlusCircle className="h-4 w-4" /> New Sale</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Record a Sale</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Product</Label>
                  <Select value={form.productId} onValueChange={v => setForm({ ...form, productId: v })}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select a product" /></SelectTrigger>
                    <SelectContent>
                      {products?.filter(p => p.quantity > 0).map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {p.price.toLocaleString()} ({p.quantity} left)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Quantity</Label>
                    <Input type="number" min={1} max={selectedProduct?.quantity || 1} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Customer</Label>
                    <Input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" className="h-10" />
                  </div>
                </div>
                {selectedProduct && (
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Order Total</p>
                    <p className="text-2xl font-extrabold text-primary tabular-nums">{(selectedProduct.price * parseInt(form.quantity || "0")).toLocaleString()}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Add notes" className="h-10" />
                </div>
                <Button onClick={handleSale} disabled={recordSale.isPending || !form.productId || !form.quantity} className="h-10 font-semibold">
                  {recordSale.isPending ? "Processing..." : "Confirm Sale"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Total Revenue" value={totalRevenue.toLocaleString()} icon={ArrowUpRight} color="primary" trend={`${totalTransactions} transactions`} />
        <MetricCard label="Transactions" value={totalTransactions} icon={Receipt} color="secondary" />
      </div>

      {/* Sales table */}
      <SectionCard title="Transaction History" icon={Receipt} noPadding>
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : !sales?.length ? (
          <EmptyState icon={Receipt} title="No sales recorded yet" description="Record your first sale to get started" />
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-sticky-header table-zebra">
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="pr-5">Customer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((s: any) => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell className="pl-5 text-sm whitespace-nowrap font-medium">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-semibold">{s.products?.name}</TableCell>
                    <TableCell className="text-mono text-muted-foreground">{s.products?.sku}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{s.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{Number(s.unit_price).toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-primary">{Number(s.total_price).toLocaleString()}</TableCell>
                    <TableCell className="pr-5 text-muted-foreground">{s.customer_name || "Walk-in"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
};

export default Sales;