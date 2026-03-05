import { sampleAssets, CATEGORIES } from "@/data/assets";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(210,60%,28%)", "hsl(174,55%,42%)", "hsl(38,92%,50%)", "hsl(0,72%,51%)", "hsl(142,60%,40%)"];

const Reports = () => {
  const byCategory = CATEGORIES.map(cat => ({
    name: cat.replace("Equipment", "Equip."),
    count: sampleAssets.filter(a => a.category === cat).length,
  }));

  const byCondition = ["New", "Good", "Fair", "Poor"].map(c => ({
    name: c,
    value: sampleAssets.filter(a => a.condition === c).length,
  })).filter(c => c.value > 0);

  const byStatus = [
    { name: "Verified", value: sampleAssets.filter(a => a.auditStatus === "Verified").length },
    { name: "Pending", value: sampleAssets.filter(a => a.auditStatus === "Pending").length },
    { name: "Discrepancy", value: sampleAssets.filter(a => a.auditStatus === "Discrepancy").length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Asset inventory insights and variance reporting</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-4">Assets by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={byCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,20%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(210,60%,28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-4">Condition Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={byCondition} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {byCondition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border bg-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-4">Audit Status Summary</h3>
          <div className="flex gap-8 items-center justify-center py-4">
            {byStatus.map((s, i) => (
              <div key={s.name} className="text-center">
                <div className="text-3xl font-bold" style={{ color: COLORS[i] }}>{s.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.name}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded bg-muted p-4">
            <h4 className="text-sm font-semibold mb-2">Variance Report Notes</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• 1 asset flagged with location discrepancy (Paper Shredder – AST-00009)</li>
              <li>• 3 assets pending re-verification from January audit cycle</li>
              <li>• Overall reconciliation rate: {Math.round(sampleAssets.filter(a => a.auditStatus === "Verified").length / sampleAssets.length * 100)}%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
