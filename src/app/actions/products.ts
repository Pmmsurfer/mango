"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { centsFromDollarString } from "@/lib/format";

const ProductSchema = z.object({
  name: z.string().trim().min(1).max(120),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  upc: z.string().trim().max(40).optional().or(z.literal("")),
  unit_cost: z.string().optional().or(z.literal("")),
  wholesale_price: z.string().optional().or(z.literal("")),
  msrp: z.string().optional().or(z.literal("")),
  case_pack: z.coerce.number().int().min(1).max(1000).default(12),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function createProduct(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!brand) return { ok: false, error: "Brand not found" };

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    upc: formData.get("upc"),
    unit_cost: formData.get("unit_cost"),
    wholesale_price: formData.get("wholesale_price"),
    msrp: formData.get("msrp"),
    case_pack: formData.get("case_pack") || 12,
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { ok: false, error: "Please check the fields." };

  const { error } = await supabase.from("products").insert({
    brand_id: brand.id,
    name: parsed.data.name,
    sku: parsed.data.sku || null,
    upc: parsed.data.upc || null,
    unit_cost_cents: centsFromDollarString(parsed.data.unit_cost) ?? 0,
    wholesale_price_cents: centsFromDollarString(parsed.data.wholesale_price) ?? 0,
    msrp_cents: centsFromDollarString(parsed.data.msrp),
    case_pack: parsed.data.case_pack,
    notes: parsed.data.notes || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/products");
  return { ok: true };
}

const UpdateSchema = ProductSchema.extend({
  id: z.string().uuid(),
  active: z
    .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
    .optional(),
});

export async function updateProduct(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = UpdateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    sku: formData.get("sku"),
    upc: formData.get("upc"),
    unit_cost: formData.get("unit_cost"),
    wholesale_price: formData.get("wholesale_price"),
    msrp: formData.get("msrp"),
    case_pack: formData.get("case_pack") || 12,
    notes: formData.get("notes"),
    active: formData.get("active") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Please check the fields." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      upc: parsed.data.upc || null,
      unit_cost_cents: centsFromDollarString(parsed.data.unit_cost) ?? 0,
      wholesale_price_cents: centsFromDollarString(parsed.data.wholesale_price) ?? 0,
      msrp_cents: centsFromDollarString(parsed.data.msrp),
      case_pack: parsed.data.case_pack,
      notes: parsed.data.notes || null,
      active: parsed.data.active === "on" || parsed.data.active === "true",
    })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/products");
  return { ok: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/products");
  return { ok: true };
}

const TagReorderSchema = z.object({
  reorder_id: z.string().uuid(),
  product_id: z.string().uuid(),
});

export async function tagReorderWithProduct(input: {
  reorder_id: string;
  product_id: string;
}) {
  const parsed = TagReorderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("unit_cost_cents")
    .eq("id", parsed.data.product_id)
    .maybeSingle();
  if (!product) return { ok: false, error: "Product not found" };

  const { data: reorder } = await supabase
    .from("reorders")
    .select("account_id")
    .eq("id", parsed.data.reorder_id)
    .maybeSingle();

  const { error } = await supabase
    .from("reorders")
    .update({
      product_id: parsed.data.product_id,
      unit_cost_cents: product.unit_cost_cents,
    })
    .eq("id", parsed.data.reorder_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/products");
  if (reorder?.account_id) {
    revalidatePath(`/app/accounts/${reorder.account_id}`);
  }
  return { ok: true };
}
