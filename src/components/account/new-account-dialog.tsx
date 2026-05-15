"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAccount } from "@/app/actions/accounts";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/lib/types";

export function NewAccountDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createAccount, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            New account
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="mt-2 flex flex-col gap-3">
          <Field label="Account name *" name="name" required placeholder="Erewhon Calabasas" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Banner" name="banner" placeholder="Erewhon" />
            <Field label="Doors" name="doors_count" type="number" defaultValue="1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Location" name="location_text" placeholder="Calabasas, CA" />
            <Field label="Region" name="region" placeholder="So Cal" />
          </div>
          <SelectField label="Stage" name="stage" defaultValue="researching">
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </SelectField>
          <Field label="Notes" name="notes" placeholder="" />
          {state?.error ? (
            <p className="text-sm text-[#9b3838]">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-2.5 text-sm font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
          >
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
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

function SelectField({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
        {label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
      >
        {children}
      </select>
    </label>
  );
}
