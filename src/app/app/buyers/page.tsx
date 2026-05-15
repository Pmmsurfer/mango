import { createClient } from "@/lib/supabase/server";
import { BuyersTable, type BuyerRow } from "@/components/buyers/buyers-table";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default async function BuyersPage() {
  const supabase = await createClient();

  const { data: buyersRaw } = await supabase
    .from("buyers")
    .select("id, name, title, email, account_id, accounts(name)")
    .order("name", { ascending: true });

  const { data: accountsRaw } = await supabase
    .from("accounts")
    .select("id, name")
    .order("name", { ascending: true });

  const buyerIds = (buyersRaw ?? []).map(
    (b) => (b as { id: string }).id
  );

  // Last contacted per buyer.
  const lastByBuyer = new Map<string, string>();
  if (buyerIds.length > 0) {
    const { data: lastInteractions } = await supabase
      .from("interactions")
      .select("buyer_id, occurred_at")
      .in("buyer_id", buyerIds)
      .order("occurred_at", { ascending: false });
    for (const i of (lastInteractions ?? []) as {
      buyer_id: string;
      occurred_at: string;
    }[]) {
      if (!lastByBuyer.has(i.buyer_id)) {
        lastByBuyer.set(i.buyer_id, i.occurred_at);
      }
    }
  }

  type BuyerJoin = {
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    account_id: string;
    accounts: { name: string } | { name: string }[] | null;
  };

  const rows: BuyerRow[] = ((buyersRaw ?? []) as BuyerJoin[]).map((b) => {
    const acct = Array.isArray(b.accounts) ? b.accounts[0] : b.accounts;
    return {
      id: b.id,
      name: b.name,
      title: b.title,
      email: b.email,
      account_id: b.account_id,
      account_name: acct?.name ?? "—",
      last_contacted_at: lastByBuyer.get(b.id) ?? null,
    };
  });

  const accountOptions = (accountsRaw ?? []) as { id: string; name: string }[];

  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-5">
        <h1 className="font-display text-2xl text-ink">Buyers</h1>
        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          {rows.length} buyer{rows.length === 1 ? "" : "s"} across{" "}
          {accountOptions.length} account{accountOptions.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex-1 px-6 py-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No buyers yet"
            description="Add the people you actually deal with on an account. The buyer is the relationship."
          />
        ) : (
          <BuyersTable rows={rows} accountOptions={accountOptions} />
        )}
      </div>
    </>
  );
}
