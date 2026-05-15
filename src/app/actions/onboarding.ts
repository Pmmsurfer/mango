"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildSeed } from "@/lib/seed";

const BrandSchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export async function createBrandAndSeed(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = BrandSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: "Brand name is required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Not signed in." };
  }

  // Make sure no brand already exists.
  const { data: existing } = await supabase
    .from("brands")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect("/app/pipeline");
  }

  const admin = createAdminClient();

  const { data: brand, error: brandError } = await admin
    .from("brands")
    .insert({ name: parsed.data.name, owner_user_id: user.id })
    .select("id")
    .single();

  if (brandError || !brand) {
    return { ok: false, error: brandError?.message ?? "Could not create brand." };
  }

  // Seed sample data.
  try {
    const seedData = buildSeed(user.id);

    for (const item of seedData) {
      const { data: account, error: accErr } = await admin
        .from("accounts")
        .insert({ brand_id: brand.id, ...item.account })
        .select("id")
        .single();
      if (accErr || !account) throw new Error(accErr?.message ?? "account insert failed");

      const buyerIds: string[] = [];
      if (item.buyers.length > 0) {
        const { data: buyers, error: buyerErr } = await admin
          .from("buyers")
          .insert(item.buyers.map((b) => ({ account_id: account.id, ...b })))
          .select("id");
        if (buyerErr) throw new Error(buyerErr.message);
        for (const b of buyers ?? []) buyerIds.push(b.id);
      }

      if (item.interactions.length > 0) {
        const { error: intErr } = await admin.from("interactions").insert(
          item.interactions.map((i) => ({
            account_id: account.id,
            buyer_id:
              i.buyerIndex !== null && buyerIds[i.buyerIndex]
                ? buyerIds[i.buyerIndex]
                : null,
            type: i.type,
            summary: i.summary,
            occurred_at: i.occurred_at,
            created_by: user.id,
          }))
        );
        if (intErr) throw new Error(intErr.message);
      }

      if (item.reorders.length > 0) {
        const { error: reoErr } = await admin.from("reorders").insert(
          item.reorders.map((r) => ({
            account_id: account.id,
            occurred_at: r.occurred_at,
            units: r.units,
            dollars: r.dollars,
          }))
        );
        if (reoErr) throw new Error(reoErr.message);
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Seed failed";
    return { ok: false, error: `Brand created, but seed failed: ${msg}` };
  }

  revalidatePath("/app", "layout");
  redirect("/app/pipeline");
}
