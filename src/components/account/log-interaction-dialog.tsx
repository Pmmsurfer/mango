"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addInteraction } from "@/app/actions/accounts";
import { INTERACTION_LABELS, type InteractionType, type Buyer } from "@/lib/types";

const ALL_TYPES: InteractionType[] = [
  "email",
  "call",
  "meeting",
  "sample",
  "pitch",
  "note",
  "reorder",
  "job_change",
];

export function LogInteractionDialog({
  accountId,
  buyers,
  trigger,
}: {
  accountId: string;
  buyers: Pick<Buyer, "id" | "name">[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(addInteraction, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            Log interaction
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="mt-2 flex flex-col gap-3">
          <input type="hidden" name="account_id" value={accountId} />
          <label className="flex flex-col gap-1">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              Type
            </span>
            <select
              name="type"
              defaultValue="note"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
            >
              {ALL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {INTERACTION_LABELS[t]}
                </option>
              ))}
            </select>
          </label>
          {buyers.length > 0 ? (
            <label className="flex flex-col gap-1">
              <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
                Buyer
              </span>
              <select
                name="buyer_id"
                defaultValue=""
                className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
              >
                <option value="">— None —</option>
                {buyers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label className="flex flex-col gap-1">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              Summary
            </span>
            <textarea
              name="summary"
              rows={3}
              placeholder="What happened?"
              className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
            />
          </label>
          {state?.error ? (
            <p className="text-sm text-[#9b3838]">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-2.5 text-sm font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
          >
            {pending ? "Logging…" : "Log it"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
