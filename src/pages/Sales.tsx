import { useState } from "react";
import { useProducts, useRecordSale, useSales } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingCart, PlusCircle, Receipt } from "lucide-react";
import { motion } from "framer-motion";
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" /> Sales
          </h1>
          <p className="text-sm text-muted-foreground">Record and track product sales</p>
        </div>
        {canSell && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><PlusCircle className="h-4 w-4" /> New Sale</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Record Sale</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div>
                  <Label>Product</Label>
                  <Select value={form.productId} onValueChange={v => setForm({ ...form, productId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>
                      {products?.filter(p => p.quantity > 0).map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — ₹{p.price} ({p.quantity} in stock)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Quantity</Label><Input type="number" min={1} max={selectedProduct?.quantity || 1} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                  <div><Label>Customer</Label><Input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Customer name" /></div>
                </div>
                {selectedProduct && (
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <p>Total: <span className="font-bold text-primary">₹{(selectedProduct.price * parseInt(form.quantity || "0")).toLocaleString()}</span></p>
                  </div>
                )}
                <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" /></div>
                <Button onClick={handleSale} disabled={recordSale.isPending || !form.productId || !form.quantity}>
                  {recordSale.isPending ? "Processing..." : "Record Sale"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Customer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : !sales?.length ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <Receipt className="h-8 w-8 text-muted-foreground/50" />No sales recorded yet
              </TableCell></TableRow>
            ) : sales.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{s.products?.name}</TableCell>
                <TableCell className="font-mono text-xs">{s.products?.sku}</TableCell>
                <TableCell className="text-right">{s.quantity}</TableCell>
                <TableCell className="text-right">₹{s.unit_price.toLocaleString()}</TableCell>
                <TableCell className="text-right font-semibold">₹{s.total_price.toLocaleString()}</TableCell>
                <TableCell className="text-muted-foreground">{s.customer_name || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default Sales;
