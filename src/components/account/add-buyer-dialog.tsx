"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addBuyer } from "@/app/actions/accounts";

export function AddBuyerDialog({
  accountId,
  trigger,
}: {
  accountId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addBuyer, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            Add buyer
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="mt-2 flex flex-col gap-3">
          <input type="hidden" name="account_id" value={accountId} />
          <Field label="Name *" name="name" required placeholder="Sasha Patel" />
          <Field label="Title" name="title" placeholder="Grocery Buyer" />
          <Field label="Email" name="email" type="email" placeholder="sasha@brand.example" />
          <Field label="Phone" name="phone" placeholder="(310) 555-1234" />
          {state?.error ? (
            <p className="text-sm text-[#9b3838]">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-2.5 text-sm font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add buyer"}
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
