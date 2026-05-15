"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logReorder, markAccountLost, snoozeAccount } from "@/app/actions/accounts";
import { MoreHorizontal } from "lucide-react";

export function LogReorderDialog({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(logReorder, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="rounded-full bg-mango px-3 py-1.5 text-xs font-medium text-white transition hover:bg-mango-deep">
        Log reorder
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            Log reorder
          </DialogTitle>
        </DialogHeader>
        <form action={formAction} className="mt-2 flex flex-col gap-3">
          <input type="hidden" name="account_id" value={accountId} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Units" name="units" type="number" placeholder="120" />
            <Field label="Dollars" name="dollars" type="number" placeholder="540" />
          </div>
          <label className="flex flex-col gap-1">
            <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
              Notes
            </span>
            <textarea
              name="notes"
              rows={3}
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
            {pending ? "Saving…" : "Log reorder"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RadarRowMenu({ accountId }: { accountId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        aria-label="Row actions"
        className="rounded-full p-1.5 text-ink-mute transition hover:bg-cream hover:text-ink"
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => startTransition(async () => { await snoozeAccount(accountId, 14); })}
        >
          Snooze 14 days
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => startTransition(async () => { await markAccountLost(accountId); })}
          className="text-[#9b3838] focus:text-[#9b3838]"
        >
          Mark lost
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
