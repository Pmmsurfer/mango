"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const MoveSchema = z.object({
  buyer_id: z.string().uuid(),
  new_account_id: z.string().uuid(),
});

export async function changeBuyerJob(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = MoveSchema.safeParse({
    buyer_id: formData.get("buyer_id"),
    new_account_id: formData.get("new_account_id"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const supabase = await createClient();
  const { data: buyer, error: bErr } = await supabase
    .from("buyers")
    .select("id, name, title, email, phone, account_id")
    .eq("id", parsed.data.buyer_id)
    .maybeSingle();

  if (bErr || !buyer) return { ok: false, error: "Buyer not found" };
  if (buyer.account_id === parsed.data.new_account_id) {
    return { ok: false, error: "Same account — nothing to move." };
  }

  const { data: newAccount } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", parsed.data.new_account_id)
    .maybeSingle();
  if (!newAccount) return { ok: false, error: "Target account not found" };

  const { data: oldAccount } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", buyer.account_id)
    .maybeSingle();

  // Create a new buyer row on the new account (relationship moves with the person).
  const { error: insErr } = await supabase.from("buyers").insert({
    account_id: parsed.data.new_account_id,
    name: buyer.name,
    title: buyer.title,
    email: buyer.email,
    phone: buyer.phone,
    notes: `Moved from ${oldAccount?.name ?? "previous account"}`,
  });
  if (insErr) return { ok: false, error: insErr.message };

  // Log job_change interactions on both old and new account.
  await supabase.from("interactions").insert([
    {
      account_id: buyer.account_id,
      buyer_id: buyer.id,
      type: "job_change",
      summary: `${buyer.name} moved to ${newAccount.name}`,
    },
    {
      account_id: parsed.data.new_account_id,
      type: "job_change",
      summary: `${buyer.name} joined from ${oldAccount?.name ?? "previous account"}`,
    },
  ]);

  revalidatePath("/app/buyers");
  revalidatePath(`/app/accounts/${buyer.account_id}`);
  revalidatePath(`/app/accounts/${parsed.data.new_account_id}`);
  return { ok: true };
}
