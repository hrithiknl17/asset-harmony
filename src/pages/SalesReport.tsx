import { useSales, useLowStockProducts, useCreateReorderRequest, useReorderRequests } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, AlertTriangle, TrendingUp, Package, Send, Crown, Medal, Award } from "lucide-react";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import StatCard from "@/components/StatCard";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(222, 62%, 32%)", "hsl(170, 45%, 42%)", "hsl(38, 88%, 48%)", "hsl(0, 68%, 48%)", "hsl(270, 55%, 48%)"];

const SALES_PEOPLE: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "Priya (Sales)",
  "d0000000-0000-0000-0000-000000000002": "Ravi (Sales)",
  "a0000000-0000-0000-0000-000000000001": "Dev Admin",
  "b0000000-0000-0000-0000-000000000001": "Hrithik (Manager)",
};

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-warning", "text-muted-foreground", "text-warning"];

const SalesReport = () => {
  const { data: sales } = useSales();
  const { data: lowStock } = useLowStockProducts();
  const { data: reorderRequests } = useReorderRequests();
  const createReorder = useCreateReorderRequest();
  const { toast } = useToast();

  const totalRevenue = sales?.reduce((sum: number, s: any) => sum + Number(s.total_price), 0) || 0;
  const totalSales = sales?.length || 0;
  const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

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

  const byCategory: Record<string, number> = {};
  sales?.forEach((s: any) => {
    const cat = s.products?.category || "Unknown";
    byCategory[cat] = (byCategory[cat] || 0) + Number(s.total_price);
  });
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

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
    <PageShell icon={BarChart3} title="Sales Report" subtitle="Revenue overview and restock management">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="primary" />
        <StatCard label="Total Sales" value={totalSales} icon={BarChart3} color="secondary" />
        <StatCard label="Avg Order Value" value={`₹${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={Package} color="success" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="section-card">
          <h2 className="section-title mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" /> Daily Revenue (Last 7 Days)
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 89%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="hsl(222, 62%, 32%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="section-card">
          <h2 className="section-title mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={72} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Sellers */}
      <div className="section-card">
        <h2 className="section-title mb-4 flex items-center gap-1.5">
          <Crown className="h-3.5 w-3.5 text-warning" /> Top Sales People
        </h2>
        {topSellers.length === 0 ? (
          <EmptyState title="No sales data yet" />
        ) : (
          <div className="space-y-1.5">
            {topSellers.map((seller, i) => {
              const RankIcon = RANK_ICONS[i] || Medal;
              const share = totalRevenue > 0 ? ((seller.revenue / totalRevenue) * 100).toFixed(1) : "0";
              return (
                <div
                  key={seller.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${i === 0 ? "bg-warning/5 border-warning/15" : "hover:bg-muted/40"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0">
                      {i < 3 ? <RankIcon className={`h-3.5 w-3.5 ${RANK_COLORS[i]}`} /> : <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{seller.name}</p>
                      <p className="text-xs text-muted-foreground">{seller.count} sales &middot; {share}% of total</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary">₹{seller.revenue.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Low Stock */}
      <div className="section-card">
        <h2 className="section-title mb-4 flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Low Stock / Out of Stock
        </h2>
        {!lowStock?.length ? (
          <EmptyState icon={Package} title="All products are well-stocked" />
        ) : (
          <div className="data-table-wrapper">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">Reorder Pt</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.map(p => (
                  <TableRow key={p.id} className="hover:bg-muted/40">
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">{p.reorder_point}</TableCell>
                    <TableCell>
                      <Badge variant={p.quantity === 0 ? "destructive" : "secondary"} className="text-[10px]">
                        {p.quantity === 0 ? "Out of Stock" : "Low Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => handleReorder(p.id, p.name)} disabled={createReorder.isPending}>
                        <Send className="h-3 w-3" /> Reorder
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Reorder Requests */}
      {reorderRequests && reorderRequests.length > 0 && (
        <div className="section-card">
          <h2 className="section-title mb-4 flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5 text-secondary" /> Recent Reorder Requests
          </h2>
          <div className="data-table-wrapper">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderRequests.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="text-sm whitespace-nowrap">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{r.products?.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.requested_quantity}</TableCell>
                    <TableCell><Badge variant={r.status === "pending" ? "secondary" : "default"} className="text-[10px]">{r.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{r.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </PageShell>
  );
};

export default SalesReport;
