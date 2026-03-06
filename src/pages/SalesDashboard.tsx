import { useSales, useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, Trophy, TrendingUp, DollarSign, Crown, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const SALES_PEOPLE: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000001": "Priya (Sales)",
  "d0000000-0000-0000-0000-000000000002": "Ravi (Sales)",
  "a0000000-0000-0000-0000-000000000001": "Dev Admin",
  "b0000000-0000-0000-0000-000000000001": "Hrithik (Manager)",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-yellow-500", "text-gray-400", "text-amber-600"];

const SalesDashboard = () => {
  const { data: sales } = useSales();
  const { data: products } = useProducts();
  const { user, profile } = useAuth();

  // Aggregate sales by person
  const bySeller: Record<string, { revenue: number; count: number; name: string }> = {};
  sales?.forEach((s: any) => {
    const id = s.sold_by;
    if (!bySeller[id]) {
      bySeller[id] = { revenue: 0, count: 0, name: SALES_PEOPLE[id] || id };
    }
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

  // Chart data
  const chartData = leaderboard.map(l => ({
    name: l.name.split(" ")[0],
    revenue: l.revenue,
  }));

  // My recent sales
  const mySales = sales?.filter((s: any) => s.sold_by === user?.id).slice(0, 8) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" /> Sales Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, {profile?.full_name || "Sales Rep"} — here's how you're doing
        </p>
      </motion.div>

      {/* Personal KPIs */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My Revenue"
          value={`₹${(myStats?.revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="primary"
          trend={`${myStats?.count || 0} transactions`}
        />
        <StatCard
          label="My Rank"
          value={myRank > 0 ? `#${myRank}` : "—"}
          icon={Trophy}
          color={myRank === 1 ? "success" : myRank <= 3 ? "warning" : "secondary"}
          trend={`of ${leaderboard.length} sales people`}
        />
        <StatCard
          label="Team Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="secondary"
          trend={`${totalSalesCount} total sales`}
        />
        <StatCard
          label="Products Available"
          value={products?.filter(p => p.quantity > 0).length || 0}
          icon={ShoppingCart}
          color="success"
          trend={`${products?.filter(p => p.quantity <= (p.reorder_point)).length || 0} low stock`}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leaderboard */}
        <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" /> Sales Leaderboard
          </h2>
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No sales recorded yet</p>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((seller, i) => {
                const RankIcon = RANK_ICONS[i] || Medal;
                const isMe = seller.id === user?.id;
                return (
                  <motion.div
                    key={seller.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors ${isMe ? "bg-primary/5 border-primary/30" : "hover:bg-muted/30"}`}
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
                        <p className="text-sm font-medium flex items-center gap-2">
                          {seller.name}
                          {isMe && <Badge variant="outline" className="text-[10px] px-1.5 py-0">You</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">{seller.count} sales</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary">₹{seller.revenue.toLocaleString()}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-4">Revenue by Sales Person</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* My Recent Sales */}
      <motion.div variants={item} className="rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="text-base font-semibold mb-4">My Recent Sales</h2>
        {mySales.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">You haven't made any sales yet — go close some deals! 💪</p>
        ) : (
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
                  <TableCell className="text-right font-bold">₹{Number(s.total_price).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SalesDashboard;
