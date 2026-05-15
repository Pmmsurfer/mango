import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? null;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url)
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=no_user", url));
  }

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (!brand) {
    return NextResponse.redirect(new URL("/onboarding", url));
  }

  return NextResponse.redirect(new URL(next ?? "/app/pipeline", url));
}
