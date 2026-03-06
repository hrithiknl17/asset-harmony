import { useSales, useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import PageShell from "@/components/PageShell";
import EmptyState from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Trophy, TrendingUp, DollarSign, Crown, Medal, Award, Receipt } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SALES_PEOPLE: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "Priya (Sales)",
  "d0000000-0000-0000-0000-000000000002": "Ravi (Sales)",
  "a0000000-0000-0000-0000-000000000001": "Dev Admin",
  "b0000000-0000-0000-0000-000000000001": "Hrithik (Manager)",
};

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-warning", "text-muted-foreground", "text-warning"];

const SalesDashboard = () => {
  const { data: sales } = useSales();
  const { data: products } = useProducts();
  const { user, profile } = useAuth();

  const bySeller: Record<string, { revenue: number; count: number; name: string }> = {};
  sales?.forEach((s: any) => {
    const id = s.sold_by;
    if (!bySeller[id]) bySeller[id] = { revenue: 0, count: 0, name: SALES_PEOPLE[id] || id };
    bySeller[id].revenue += Number(s.total_price);
    bySeller[id].count += 1;
  });

  const leaderboard = Object.entries(bySeller)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  const myStats = user ? bySeller[user.id] : null;
  const myRank = user ? leaderboard.findIndex(l => l.id === user.id) + 1 : 0;
  const totalRevenue = leaderboard.reduce((sum, l) => sum + l.revenue, 0);
  const totalSalesCount = leaderboard.reduce((sum, l) => sum + l.count, 0);

  const chartData = leaderboard.map(l => ({
    name: l.name.split(" ")[0],
    revenue: l.revenue,
  }));

  const mySales = sales?.filter((s: any) => s.sold_by === user?.id).slice(0, 8) || [];

  return (
    <PageShell
      icon={ShoppingCart}
      title="Sales Dashboard"
      subtitle={`Welcome back, ${profile?.full_name || "Sales Rep"} — here's how you're doing`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Revenue" value={`₹${(myStats?.revenue || 0).toLocaleString()}`} icon={DollarSign} color="primary" trend={`${myStats?.count || 0} transactions`} />
        <StatCard label="My Rank" value={myRank > 0 ? `#${myRank}` : "—"} icon={Trophy} color={myRank === 1 ? "success" : myRank <= 3 ? "warning" : "secondary"} trend={`of ${leaderboard.length} sales people`} />
        <StatCard label="Team Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="secondary" trend={`${totalSalesCount} total sales`} />
        <StatCard label="Products Available" value={products?.filter(p => p.quantity > 0).length || 0} icon={ShoppingCart} color="success" trend={`${products?.filter(p => p.quantity <= p.reorder_point).length || 0} low stock`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Leaderboard */}
        <div className="section-card">
          <h2 className="section-title mb-4 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-primary" /> Sales Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <EmptyState title="No sales recorded yet" description="Start making sales to see the leaderboard" />
          ) : (
            <div className="space-y-1.5">
              {leaderboard.map((seller, i) => {
                const RankIcon = RANK_ICONS[i] || Medal;
                const isMe = seller.id === user?.id;
                return (
                  <div
                    key={seller.id}
                    className={`flex items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${isMe ? "bg-primary/5 border-primary/20" : "hover:bg-muted/40"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted shrink-0">
                        {i < 3 ? (
                          <RankIcon className={`h-3.5 w-3.5 ${RANK_COLORS[i]}`} />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {seller.name}
                          {isMe && <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">You</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">{seller.count} sales</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">₹{seller.revenue.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="section-card">
          <h2 className="section-title mb-4">Revenue by Sales Person</h2>
          {chartData.length === 0 ? (
            <EmptyState title="No data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 89%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(222, 62%, 32%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* My Recent Sales */}
      <div className="section-card">
        <h2 className="section-title mb-4">My Recent Sales</h2>
        {mySales.length === 0 ? (
          <EmptyState icon={Receipt} title="No sales yet" description="Go close some deals!" />
        ) : (
          <div className="data-table-wrapper">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mySales.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{s.products?.name || "—"}</TableCell>
                    <TableCell>{s.customer_name || "Walk-in"}</TableCell>
                    <TableCell className="text-right">{s.quantity}</TableCell>
                    <TableCell className="text-right font-semibold">₹{Number(s.total_price).toLocaleString()}</TableCell>
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

export default SalesDashboard;
