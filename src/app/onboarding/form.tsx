"use client";

import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { createBrandAndSeed } from "@/app/actions/onboarding";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createBrandAndSeed, null);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        Brand name
      </label>
      <input
        type="text"
        name="name"
        required
        autoFocus
        placeholder="e.g. Olipop, Magic Spoon, your brand…"
        className="rounded-md border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
      />
      {state?.error ? (
        <p className="text-sm text-[#9b3838]">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-3 text-[15px] font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
      >
        {pending ? "Setting up your workspace…" : "Create my workspace"}
        {!pending ? <ArrowRight className="size-4" /> : null}
      </button>
      <p className="font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        Takes a few seconds.
      </p>
    </form>
  );
}
