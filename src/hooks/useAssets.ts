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
    queryKey: ["assets", "with-auditor"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get unique auditor IDs and fetch their names from profiles
      const auditorIds = [...new Set(
        (data as DbAsset[])
          .map(a => a.last_audited_by)
          .filter(Boolean) as string[]
      )];

      let profileMap: Record<string, string> = {};
      if (auditorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", auditorIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name]));
        }
      }

      return (data as DbAsset[]).map(a => ({
        ...a,
        auditor_profile: a.last_audited_by && profileMap[a.last_audited_by]
          ? { full_name: profileMap[a.last_audited_by] }
          : null,
      })) as (DbAsset & { auditor_profile: { full_name: string } | null })[];
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

export const useDeleteAssets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("assets").delete().in("id", ids);
      if (error) throw error;
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
