import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, PackageCheck, PackageX, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const StockCheck = () => {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <PackageCheck className="h-6 w-6 text-primary" /> Stock Availability
        </h1>
        <p className="text-sm text-muted-foreground">Check if items are available for customers</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9 h-12 text-base" placeholder="Search by product name, SKU, or category..." value={search} onChange={e => setSearch(e.target.value)} autoFocus />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading products...</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-5 shadow-sm transition-all ${
                p.quantity === 0 ? "bg-destructive/5 border-destructive/20" :
                p.quantity <= p.reorder_point ? "bg-warning/5 border-warning/20" :
                "bg-card"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                </div>
                {p.quantity === 0 ? (
                  <PackageX className="h-5 w-5 text-destructive" />
                ) : p.quantity <= p.reorder_point ? (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                ) : (
                  <PackageCheck className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{p.quantity}</p>
                  <p className="text-xs text-muted-foreground">units available</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{p.price.toLocaleString()}</p>
                  <Badge variant={p.quantity === 0 ? "destructive" : p.quantity <= p.reorder_point ? "secondary" : "default"} className="text-xs mt-1">
                    {p.quantity === 0 ? "Out of Stock" : p.quantity <= p.reorder_point ? "Low Stock" : "Available"}
                  </Badge>
                </div>
              </div>
              {p.location && <p className="text-xs text-muted-foreground mt-2">📍 {p.location}</p>}
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              {search ? "No products match your search" : "No products in warehouse"}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default StockCheck;
