"use client";

import { useActionState, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/app/actions/products";
import type { Product } from "@/lib/types";

export function NewProductDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProduct, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            New SKU
          </DialogTitle>
        </DialogHeader>
        <ProductFormFields action={formAction} pending={pending} error={state?.error} />
      </DialogContent>
    </Dialog>
  );
}

export function EditProductDialog({
  product,
  trigger,
}: {
  product: Product;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateProduct, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger as React.ReactElement} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink">
            Edit SKU
          </DialogTitle>
        </DialogHeader>
        <ProductFormFields
          action={formAction}
          pending={pending}
          error={state?.error}
          product={product}
        />
      </DialogContent>
    </Dialog>
  );
}

function ProductFormFields({
  action,
  pending,
  error,
  product,
}: {
  action: (formData: FormData) => void;
  pending: boolean;
  error?: string;
  product?: Product;
}) {
  const toDollars = (cents: number | null | undefined) =>
    cents == null ? "" : (cents / 100).toFixed(2);
  return (
    <form action={action} className="mt-2 flex flex-col gap-3">
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <Field
        label="Product name *"
        name="name"
        required
        defaultValue={product?.name ?? ""}
        placeholder="Calabasas Lemonade — 12oz"
      />
      <div className="grid grid-cols-2 gap-3">
        <Field
          label="SKU"
          name="sku"
          defaultValue={product?.sku ?? ""}
          placeholder="MAN-LEM-12"
        />
        <Field
          label="Case pack"
          name="case_pack"
          type="number"
          defaultValue={String(product?.case_pack ?? 12)}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Field
          label="Unit cost ($)"
          name="unit_cost"
          type="number"
          step="0.01"
          defaultValue={toDollars(product?.unit_cost_cents)}
          placeholder="1.85"
        />
        <Field
          label="Wholesale ($)"
          name="wholesale_price"
          type="number"
          step="0.01"
          defaultValue={toDollars(product?.wholesale_price_cents)}
          placeholder="3.50"
        />
        <Field
          label="MSRP ($)"
          name="msrp"
          type="number"
          step="0.01"
          defaultValue={toDollars(product?.msrp_cents)}
          placeholder="5.99"
        />
      </div>
      <Field
        label="UPC"
        name="upc"
        defaultValue={product?.upc ?? ""}
        placeholder="0860001234567"
      />
      <label className="flex flex-col gap-1">
        <span className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          Notes
        </span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={product?.notes ?? ""}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-mango focus:ring-2 focus:ring-mango/20"
        />
      </label>
      {product ? (
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product.active}
            className="size-4 rounded border-line accent-mango"
          />
          Active
        </label>
      ) : null}
      {error ? <p className="text-sm text-[#9b3838]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-mango px-5 py-2.5 text-sm font-medium text-white transition hover:bg-mango-deep disabled:opacity-50"
      >
        {pending ? "Saving…" : product ? "Save changes" : "Create SKU"}
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
