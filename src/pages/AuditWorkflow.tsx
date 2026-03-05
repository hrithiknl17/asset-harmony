import { sampleAssets } from "@/data/assets";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertTriangle, ClipboardCheck, ScanSearch, BarChart3, FileCheck } from "lucide-react";

const steps = [
  { icon: ScanSearch, title: "1. Physical Scan", desc: "Walk through each location and scan/count every asset using QR codes or manual count." },
  { icon: ClipboardCheck, title: "2. Register Match", desc: "Compare scanned data against the master register to identify matches, missing, and unregistered items." },
  { icon: BarChart3, title: "3. Variance Report", desc: "Generate a variance report listing discrepancies: missing assets, location mismatches, condition changes." },
  { icon: FileCheck, title: "4. Reconciliation", desc: "Investigate and resolve each discrepancy. Update the register with corrections. Mark assets as verified." },
];

const AuditWorkflow = () => {
  const verified = sampleAssets.filter(a => a.auditStatus === "Verified");
  const pending = sampleAssets.filter(a => a.auditStatus === "Pending");
  const discrepancy = sampleAssets.filter(a => a.auditStatus === "Discrepancy");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Workflow</h1>
        <p className="text-sm text-muted-foreground">Baseline reconciliation and verification process</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(step => (
          <div key={step.title} className="rounded-lg border bg-card p-5">
            <step.icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {[
          { title: "Verified", icon: CheckCircle2, items: verified, color: "text-success", badge: "default" as const },
          { title: "Pending Verification", icon: Clock, items: pending, color: "text-warning", badge: "secondary" as const },
          { title: "Discrepancies", icon: AlertTriangle, items: discrepancy, color: "text-destructive", badge: "destructive" as const },
        ].map(group => (
          <div key={group.title} className="rounded-lg border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <group.icon className={`h-5 w-5 ${group.color}`} />
              <h3 className="font-semibold text-sm">{group.title}</h3>
              <Badge variant={group.badge} className="ml-auto text-xs">{group.items.length}</Badge>
            </div>
            <div className="space-y-2">
              {group.items.map(a => (
                <div key={a.id} className="flex items-center justify-between border rounded px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.location}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{a.assetId}</span>
                </div>
              ))}
              {group.items.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No items</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuditWorkflow;
