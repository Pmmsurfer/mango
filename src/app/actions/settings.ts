"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
  name: z.string().trim().min(1).max(80),
  logo_url: z.string().trim().url().optional().or(z.literal("")),
});

export async function updateBrand(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = Schema.safeParse({
    name: formData.get("name"),
    logo_url: formData.get("logo_url"),
  });
  if (!parsed.success) return { ok: false, error: "Please check the fields." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  const { error } = await supabase
    .from("brands")
    .update({
      name: parsed.data.name,
      logo_url: parsed.data.logo_url || null,
    })
    .eq("owner_user_id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/app", "layout");
  return { ok: true };
}
