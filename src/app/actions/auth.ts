"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const EmailSchema = z.object({ email: z.string().email() });

export async function sendMagicLink(
  _prev: { ok: boolean; error?: string; sentTo?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string; sentTo?: string }> {
  const parsed = EmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email." };
  }
  const { email } = parsed.data;

  const supabase = await createClient();
  const headerList = await headers();
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const host = headerList.get("host") ?? "localhost:3737";
  const origin = `${proto}://${host}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, sentTo: email };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
