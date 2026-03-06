import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DbAsset {
  id: string;
  asset_id: string;
  name: string;
  category: string;
  location: string;
  building: string;
  floor: string;
  room: string;
  department: string;
  vendor: string;
  model: string;
  serial_number: string;
  purchase_date: string | null;
  condition: string;
  audit_status: string;
  last_audit_date: string | null;
  last_audited_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useAssets = () => {
  return useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbAsset[];
    },
  });
};

export const useUpdateAuditStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assetId, newStatus, notes }: { assetId: string; newStatus: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: asset } = await supabase.from("assets").select("audit_status").eq("id", assetId).single();

      const { error: updateError } = await supabase
        .from("assets")
        .update({
          audit_status: newStatus,
          last_audit_date: new Date().toISOString().split("T")[0],
          last_audited_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assetId);
      if (updateError) throw updateError;

      const { error: logError } = await supabase.from("audit_logs").insert({
        asset_id: assetId,
        auditor_id: user.id,
        previous_status: asset?.audit_status || null,
        new_status: newStatus,
        notes: notes || "",
      });
      if (logError) throw logError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });
};

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });
};
