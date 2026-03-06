import { useSales, useLowStockProducts, useCreateReorderRequest, useReorderRequests } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, AlertTriangle, TrendingUp, Package, Send, Crown, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(38, 92%, 50%)", "hsl(0, 72%, 51%)", "hsl(270, 60%, 50%)"];

const SALES_PEOPLE: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "Priya (Sales)",
  "d0000000-0000-0000-0000-000000000002": "Ravi (Sales)",
  "a0000000-0000-0000-0000-000000000001": "Dev Admin",
  "b0000000-0000-0000-0000-000000000001": "Hrithik (Manager)",
};

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

const SalesReport = () => {
  const { data: sales } = useSales();
  const { data: lowStock } = useLowStockProducts();
  const { data: reorderRequests } = useReorderRequests();
  const createReorder = useCreateReorderRequest();
  const { toast } = useToast();

  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + Number(s.total_price), 0) || 0;
  const totalSales = sales?.length || 0;
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Top sellers
  const bySeller: Record<string, { revenue: number; count: number; name: string }> = {};
  sales?.forEach((s: any) => {
    const id = s.sold_by;
    if (!bySeller[id]) bySeller[id] = { revenue: 0, count: 0, name: SALES_PEOPLE[id] || id };
    bySeller[id].revenue += Number(s.total_price);
    bySeller[id].count += 1;
  });
  const topSellers = Object.entries(bySeller)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Sales by category
  const byCategory: Record<string, number> = {};
  sales?.forEach((s: any) => {
    const cat = s.products?.category || "Unknown";
    byCategory[cat] = (byCategory[cat] || 0) + Number(s.total_price);
  });
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  // Sales by day (last 7 days)
  const dailySales: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dailySales[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
  }
  sales?.forEach((s: any) => {
    const d = new Date(s.created_at).toLocaleDateString("en-US", { weekday: "short" });
    if (d in dailySales) dailySales[d] += Number(s.total_price);
  });
  const dailyData = Object.entries(dailySales).map(([day, revenue]) => ({ day, revenue }));

  const handleReorder = async (productId: string, name: string) => {
    try {
      await createReorder.mutateAsync({ productId, quantity: 50, notes: `Auto-reorder for ${name}` });
      toast({ title: "Reorder request sent", description: `Request for ${name} created` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" /> Sales Report
        </h1>
        <p className="text-sm text-muted-foreground">Revenue overview and restock management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-3xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Sales</p>
          <p className="text-3xl font-bold">{totalSales}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <p className="text-sm text-muted-foreground">Avg Order Value</p>
          <p className="text-3xl font-bold">₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Daily Revenue (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Sellers */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" /> Top Sales People
        </h2>
        {topSellers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No sales data yet</p>
        ) : (
          <div className="space-y-2">
            {topSellers.map((seller, i) => {
              const RankIcon = RANK_ICONS[i] || Medal;
              const share = totalRevenue > 0 ? ((seller.revenue / totalRevenue) * 100).toFixed(1) : "0";
              return (
                <div
                  key={seller.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${i === 0 ? "bg-yellow-500/5 border-yellow-500/20" : "hover:bg-muted/30"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {i < 3 ? (
                        <RankIcon className={`h-4 w-4 ${RANK_COLORS[i]}`} />
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{seller.name}</p>
                      <p className="text-xs text-muted-foreground">{seller.count} sales • {share}% of total</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary">₹{seller.revenue.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" /> Low Stock / Out of Stock — Reorder
        </h2>
        {!lowStock?.length ? (
          <p className="text-sm text-muted-foreground py-4 text-center">All products are well-stocked 🎉</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-right">{p.reorder_point}</TableCell>
                  <TableCell>
                    <Badge variant={p.quantity === 0 ? "destructive" : "secondary"}>
                      {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReorder(p.id, p.name)} disabled={createReorder.isPending}>
                      <Send className="h-3 w-3" /> Reorder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Reorder Requests */}
      {reorderRequests && reorderRequests.length > 0 && (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-secondary" /> Recent Reorder Requests
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reorderRequests.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{r.products?.name}</TableCell>
                  <TableCell className="text-right">{r.requested_quantity}</TableCell>
                  <TableCell><Badge variant={r.status === "pending" ? "secondary" : "default"}>{r.status}</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-sm">{r.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
};

export default SalesReport;
