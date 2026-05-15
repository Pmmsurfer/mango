import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { Italic } from "@/components/ui/italic";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./form";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (brand) redirect("/app/pipeline");

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Wordmark />
      </header>
      <main className="mx-auto mt-12 max-w-lg px-6 sm:mt-20">
        <p className="font-data text-[11px] uppercase tracking-[0.24em] text-ink-mute">
          One last thing
        </p>
        <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
          What&apos;s your <Italic>brand</Italic>?
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          We&apos;ll create your workspace and pre-fill 12 sample retailer
          accounts — Erewhon, Whole Foods, Bristol Farms, Foxtrot and a few
          more — so you can see how Mango works before you bring in your real
          accounts.
        </p>
        <div className="mt-8">
          <OnboardingForm />
        </div>
      </main>
    </div>
  );
}
