"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { STAGE_LABELS, type AccountStage } from "@/lib/types";

const STAGE_VALUES: [AccountStage, ...AccountStage[]] = [
  "researching",
  "pitched",
  "approved",
  "on_shelf",
  "reordering",
  "lost",
];

const MoveSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(STAGE_VALUES),
});

export async function moveAccountStage(input: { id: string; stage: AccountStage }) {
  const parsed = MoveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { data: current, error: getErr } = await supabase
    .from("accounts")
    .select("id, stage, name")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (getErr || !current) return { ok: false, error: "Not found" };
  if (current.stage === parsed.data.stage) {
    return { ok: true };
  }

  const { error: updErr } = await supabase
    .from("accounts")
    .update({ stage: parsed.data.stage })
    .eq("id", parsed.data.id);
  if (updErr) return { ok: false, error: updErr.message };

  await supabase.from("interactions").insert({
    account_id: parsed.data.id,
    type: "note",
    summary: `Moved to ${STAGE_LABELS[parsed.data.stage]}`,
    created_by: user.id,
  });

  revalidatePath("/app/pipeline");
  revalidatePath(`/app/accounts/${parsed.data.id}`);
  return { ok: true };
}

const NewAccountSchema = z.object({
  name: z.string().trim().min(1).max(120),
  banner: z.string().trim().max(120).optional().or(z.literal("")),
  location_text: z.string().trim().max(120).optional().or(z.literal("")),
  region: z.string().trim().max(80).optional().or(z.literal("")),
  doors_count: z.coerce.number().int().min(0).max(10000).default(1),
  stage: z.enum(STAGE_VALUES).default("researching"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function createAccount(
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

  const parsed = NewAccountSchema.safeParse({
    name: formData.get("name"),
    banner: formData.get("banner"),
    location_text: formData.get("location_text"),
    region: formData.get("region"),
    doors_count: formData.get("doors_count") || 1,
    stage: formData.get("stage") || "researching",
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please check the fields." };
  }

  const { error } = await supabase.from("accounts").insert({
    brand_id: brand.id,
    name: parsed.data.name,
    banner: parsed.data.banner || null,
    location_text: parsed.data.location_text || null,
    region: parsed.data.region || null,
    doors_count: parsed.data.doors_count,
    stage: parsed.data.stage,
    notes: parsed.data.notes || null,
    tags: [],
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/pipeline");
  revalidatePath("/app/accounts");
  return { ok: true };
}

const BuyerSchema = z.object({
  account_id: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
});

export async function addBuyer(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = BuyerSchema.safeParse({
    account_id: formData.get("account_id"),
    name: formData.get("name"),
    title: formData.get("title"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { ok: false, error: "Please check the fields." };

  const supabase = await createClient();
  const { error } = await supabase.from("buyers").insert({
    account_id: parsed.data.account_id,
    name: parsed.data.name,
    title: parsed.data.title || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/app/accounts/${parsed.data.account_id}`);
  revalidatePath("/app/buyers");
  return { ok: true };
}

const ReorderSchema = z.object({
  account_id: z.string().uuid(),
  product_id: z.string().uuid().optional().or(z.literal("")),
  units: z.coerce.number().int().min(0).max(1_000_000).optional(),
  dollars: z.coerce.number().min(0).max(10_000_000).optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function logReorder(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = ReorderSchema.safeParse({
    account_id: formData.get("account_id"),
    product_id: formData.get("product_id") || "",
    units: formData.get("units") || undefined,
    dollars: formData.get("dollars") || undefined,
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { ok: false, error: "Please check the fields." };

  const supabase = await createClient();
  const occurred_at = new Date().toISOString();

  let productSummary = "";
  let unitCostCents: number | null = null;
  if (parsed.data.product_id) {
    const { data: product } = await supabase
      .from("products")
      .select("name, sku, unit_cost_cents")
      .eq("id", parsed.data.product_id)
      .maybeSingle();
    if (product) {
      unitCostCents = product.unit_cost_cents;
      productSummary = product.sku ? `${product.sku} · ` : `${product.name} · `;
    }
  }

  const { error } = await supabase.from("reorders").insert({
    account_id: parsed.data.account_id,
    occurred_at,
    units: parsed.data.units ?? null,
    dollars: parsed.data.dollars ?? null,
    notes: parsed.data.notes || null,
    product_id: parsed.data.product_id || null,
    unit_cost_cents: unitCostCents,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("interactions").insert({
    account_id: parsed.data.account_id,
    type: "reorder",
    summary: parsed.data.units
      ? `${productSummary}Reorder · ${parsed.data.units} units${
          parsed.data.dollars ? ` · $${parsed.data.dollars.toFixed(0)}` : ""
        }`
      : "Reorder logged",
    occurred_at,
  });

  // Bump the account to "reordering" if it was on_shelf.
  await supabase
    .from("accounts")
    .update({ stage: "reordering" })
    .eq("id", parsed.data.account_id)
    .eq("stage", "on_shelf");

  revalidatePath("/app/radar");
  revalidatePath(`/app/accounts/${parsed.data.account_id}`);
  revalidatePath("/app/pipeline");
  return { ok: true };
}

export async function markAccountLost(accountId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ stage: "lost" })
    .eq("id", accountId);
  if (error) return { ok: false, error: error.message };

  await supabase.from("interactions").insert({
    account_id: accountId,
    type: "note",
    summary: "Marked as lost",
  });
  revalidatePath("/app/radar");
  revalidatePath("/app/pipeline");
  revalidatePath(`/app/accounts/${accountId}`);
  return { ok: true };
}

export async function snoozeAccount(accountId: string, days = 14) {
  const supabase = await createClient();
  const due = new Date();
  due.setDate(due.getDate() + days);
  const { error } = await supabase.from("reminders").insert({
    account_id: accountId,
    due_date: due.toISOString().slice(0, 10),
    label: `Snoozed from Radar for ${days} days`,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/radar");
  return { ok: true };
}

const InteractionSchema = z.object({
  account_id: z.string().uuid(),
  buyer_id: z.string().uuid().optional().or(z.literal("")),
  type: z.enum([
    "email",
    "call",
    "meeting",
    "sample",
    "reorder",
    "pitch",
    "note",
    "job_change",
  ]),
  summary: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function addInteraction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = InteractionSchema.safeParse({
    account_id: formData.get("account_id"),
    buyer_id: formData.get("buyer_id"),
    type: formData.get("type"),
    summary: formData.get("summary"),
  });
  if (!parsed.success) return { ok: false, error: "Please check the fields." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { error } = await supabase.from("interactions").insert({
    account_id: parsed.data.account_id,
    buyer_id: parsed.data.buyer_id || null,
    type: parsed.data.type,
    summary: parsed.data.summary || null,
    created_by: user.id,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/app/accounts/${parsed.data.account_id}`);
  return { ok: true };
}
