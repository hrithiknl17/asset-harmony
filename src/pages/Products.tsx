import { useState } from "react";
import { useProducts, useAddProduct } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Search, Package, AlertTriangle } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/TableSkeleton";
import { useToast } from "@/hooks/use-toast";

const Products = () => {
  const { data: products, isLoading } = useProducts();
  const addProduct = useAddProduct();
  const { role } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", category: "", description: "", price: "", quantity: "", reorder_point: "10", location: "" });

  const canManage = role === "admin" || role === "manager";
  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleAdd = async () => {
    try {
      await addProduct.mutateAsync({
        sku: form.sku, name: form.name, category: form.category, description: form.description,
        price: parseFloat(form.price) || 0, quantity: parseInt(form.quantity) || 0,
        reorder_point: parseInt(form.reorder_point) || 10, location: form.location, image_url: null,
      });
      toast({ title: "Product added successfully" });
      setOpen(false);
      setForm({ sku: "", name: "", category: "", description: "", price: "", quantity: "", reorder_point: "10", location: "" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <PageShell
      icon={Package}
      title="Product Catalog"
      subtitle={`${filtered.length} products in warehouse`}
      actions={
        canManage ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><PlusCircle className="h-4 w-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>SKU</Label><Input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="IKEA-001" /></div>
                  <div className="space-y-1.5"><Label>Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="KALLAX Shelf" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label>Category</Label><Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Furniture" /></div>
                  <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Aisle B3" /></div>
                </div>
                <div className="space-y-1.5"><Label>Description</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="White shelf unit" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5"><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Reorder Pt</Label><Input type="number" value={form.reorder_point} onChange={e => setForm({ ...form, reorder_point: e.target.value })} /></div>
                </div>
                <Button onClick={handleAdd} disabled={addProduct.isPending || !form.sku || !form.name || !form.category}>
                  {addProduct.isPending ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : undefined
      }
      filters={
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 h-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      }
    >
      <div className="data-table-wrapper">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products found" description={search ? "Try a different search term" : "Add your first product to get started"} />
        ) : (
          <div className="overflow-x-auto">
            <Table className="table-sticky-header table-zebra">
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right tabular-nums">₹{p.price.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.quantity}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{p.location}</TableCell>
                    <TableCell>
                      {p.quantity === 0 ? (
                        <Badge variant="destructive" className="gap-1 text-[10px]"><AlertTriangle className="h-3 w-3" />Out of Stock</Badge>
                      ) : p.quantity <= p.reorder_point ? (
                        <Badge variant="secondary" className="gap-1 text-[10px]"><AlertTriangle className="h-3 w-3" />Low Stock</Badge>
                      ) : (
                        <Badge className="text-[10px]">In Stock</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default Products;
