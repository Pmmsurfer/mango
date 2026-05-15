"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { changeBuyerJob } from "@/app/actions/buyers";

export function ChangeJobDialog({
  buyer,
  accountOptions,
  trigger,
}: {
  buyer: { id: string; name: string; account_id: string };
  accountOptions: { id: string; name: string }[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(changeBuyerJob, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  const others = accountOptions.filter((a) => a.id !== buyer.account_id);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            {buyer.name} changed jobs
          </DialogTitle>
        </DialogHeader>
        <p className="mt-1 text-sm text-ink-soft">
          We&apos;ll move the relationship over and log it on both accounts.
        </p>
        <form action={formAction} className="mt-4 flex flex-col gap-3">
          <input type="hidden" name="buyer_id" value={buyer.id} />
          <label className="flex flex-col gap-1">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              New account
            </span>
            <select
              name="new_account_id"
              required
              defaultValue=""
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
            >
              <option value="" disabled>
                Choose an account…
              </option>
              {others.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          {state?.error ? (
            <p className="text-sm text-[#9b3838]">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-2.5 text-sm font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
          >
            {pending ? "Moving…" : "Move buyer"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
