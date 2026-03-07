import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const BUDGET_LIMIT = 50000; // ₹50,000 — auto-approve below, require admin approval above

export interface AssetReorderRequest {
  id: string;
  asset_id: string;
  requested_by: string;
  estimated_cost: number;
  status: string;
  approved_by: string | null;
  rejection_reason: string | null;
  vendor_email_sent: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const useAssetReorderRequests = () => {
  return useQuery({
    queryKey: ["asset_reorder_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_reorder_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as AssetReorderRequest[];
    },
  });
};

export const useCreateAssetReorder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requests: { asset_id: string; estimated_cost: number; notes: string }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const rows = requests.map(r => ({
        asset_id: r.asset_id,
        requested_by: user.id,
        estimated_cost: r.estimated_cost,
        notes: r.notes,
        status: r.estimated_cost <= BUDGET_LIMIT ? "auto_approved" : "pending_approval",
      }));

      const { error } = await supabase.from("asset_reorder_requests").insert(rows);
      if (error) throw error;

      return rows;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["asset_reorder_requests"] }),
  });
};

export const useApproveRejectReorder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, reason }: { id: string; action: "approved" | "rejected"; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("asset_reorder_requests")
        .update({
          status: action,
          approved_by: user.id,
          rejection_reason: action === "rejected" ? (reason || "") : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["asset_reorder_requests"] }),
  });
};
