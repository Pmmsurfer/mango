"use client";

import { useActionState } from "react";
import { sendMagicLink } from "@/app/actions/auth";
import { ArrowRight, Mail } from "lucide-react";

export function MagicLinkForm({ ctaLabel = "Send magic link" }: { ctaLabel?: string }) {
  const [state, formAction, pending] = useActionState(sendMagicLink, null);

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6 text-center">
        <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-mango/10 text-mango">
          <Mail className="size-5" />
        </div>
        <h3 className="mt-4 font-display text-2xl text-ink">
          Check your inbox
        </h3>
        <p className="mt-2 text-sm text-ink-soft">
          We sent a magic link to{" "}
          <span className="font-data text-ink">{state.sentTo}</span>. Click it
          to sign in. Link expires in 1 hour.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        Email
      </label>
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="you@brand.com"
        className="rounded-md border border-line bg-surface px-4 py-3 text-[15px] outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
      />
      {state?.error ? (
        <p className="text-sm text-[#9b3838]">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-3 text-[15px] font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
      >
        {pending ? "Sending…" : ctaLabel}
        {!pending ? (
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        ) : null}
      </button>
      <p className="font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
        No passwords. We email you a one-tap sign-in link.
      </p>
    </form>
  );
}
