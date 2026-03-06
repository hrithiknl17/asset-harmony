import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  reorder_point: number;
  location: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: ["products", "low-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("quantity", { ascending: true });
      if (error) throw error;
      return (data as Product[]).filter(p => p.quantity <= p.reorder_point);
    },
  });
};

export const useAddProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("products").insert(product);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { error } = await supabase
        .from("products")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
};

export const useRecordSale = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ productId, quantity, unitPrice, customerName, notes }: {
      productId: string; quantity: number; unitPrice: number; customerName: string; notes?: string;
    }) => {
      // Deduct stock
      const { data: product } = await supabase.from("products").select("quantity").eq("id", productId).single();
      if (!product || product.quantity < quantity) throw new Error("Insufficient stock");

      const { error: updateErr } = await supabase
        .from("products")
        .update({ quantity: product.quantity - quantity, updated_at: new Date().toISOString() })
        .eq("id", productId);
      if (updateErr) throw updateErr;

      const { error: saleErr } = await supabase.from("sales").insert({
        product_id: productId,
        quantity,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        sold_by: user!.id,
        customer_name: customerName,
        notes: notes || "",
      });
      if (saleErr) throw saleErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
    },
  });
};

export const useSales = () => {
  return useQuery({
    queryKey: ["sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*, products(name, sku, category)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useReorderRequests = () => {
  return useQuery({
    queryKey: ["reorder_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reorder_requests")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateReorderRequest = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ productId, quantity, notes }: { productId: string; quantity: number; notes?: string }) => {
      const { error } = await supabase.from("reorder_requests").insert({
        product_id: productId,
        requested_quantity: quantity,
        requested_by: user!.id,
        notes: notes || "",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reorder_requests"] }),
  });
};
