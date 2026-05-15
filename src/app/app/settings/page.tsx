import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: brand } = await supabase
    .from("brands")
    .select("name, logo_url")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-5">
        <h1 className="font-display text-2xl text-ink">Settings</h1>
        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          {user.email}
        </p>
      </div>
      <div className="flex-1 px-6 py-6">
        <div className="grid max-w-3xl gap-6 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-lg border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Brand profile</h2>
            <p className="mt-1 text-sm text-ink-soft">
              How your workspace appears across Mango.
            </p>
            <div className="mt-5">
              <SettingsForm
                initialName={brand?.name ?? ""}
                initialLogoUrl={brand?.logo_url ?? ""}
              />
            </div>
          </section>
          <section className="rounded-lg border border-line bg-surface p-6">
            <h2 className="font-display text-xl text-ink">Billing</h2>
            <p className="mt-1 text-sm text-ink-soft">
              You&apos;re on the 30-day free trial. Billing turns on after trial ends.
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-baseline justify-between border-b border-line/60 pb-3">
                <dt className="text-ink-mute">Plan</dt>
                <dd className="font-medium text-ink">Mango · $50/mo</dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-line/60 pb-3">
                <dt className="text-ink-mute">Status</dt>
                <dd className="font-medium text-leaf">Trial</dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-ink-mute">Payment method</dt>
                <dd className="text-ink-mute">— not added —</dd>
              </div>
            </dl>
            <button
              disabled
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-line bg-cream/40 px-5 py-2.5 text-sm text-ink-mute"
              title="Coming soon"
            >
              Add payment method (soon)
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
