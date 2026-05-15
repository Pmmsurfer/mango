"use client";

import { useActionState } from "react";
import { updateBrand } from "@/app/actions/settings";

export function SettingsForm({
  initialName,
  initialLogoUrl,
}: {
  initialName: string;
  initialLogoUrl: string;
}) {
  const [state, formAction, pending] = useActionState(updateBrand, null);
  return (
    <form action={formAction} className="flex flex-col gap-3">
      <Field
        label="Brand name"
        name="name"
        defaultValue={initialName}
        required
      />
      <Field
        label="Logo URL (optional)"
        name="logo_url"
        type="url"
        defaultValue={initialLogoUrl}
        placeholder="https://…"
      />
      {state?.ok ? (
        <p className="text-sm text-leaf">Saved.</p>
      ) : state?.error ? (
        <p className="text-sm text-[#9b3838]">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex w-fit items-center justify-center gap-2 rounded-full bg-mango px-5 py-2.5 text-sm font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </span>
      <input
        type={type}
        name={name}
        className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
        {...rest}
      />
    </label>
  );
}
