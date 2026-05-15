import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AvatarCircle } from "@/components/ui/avatar-circle";
import { Tag } from "@/components/ui/tag";
import { STAGE_LABELS, type Account } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AccountsListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .order("updated_at", { ascending: false });

  const accounts = (data ?? []) as Account[];

  return (
    <>
      <div className="border-b border-line bg-surface px-6 py-4">
        <h1 className="font-display text-2xl text-ink">Accounts</h1>
        <p className="font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
          {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex-1 px-6 py-6">
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-cream/40">
              <tr className="text-left">
                <Th>Account</Th>
                <Th>Doors</Th>
                <Th>Location</Th>
                <Th>Stage</Th>
                <Th>Tags</Th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-line/60 last:border-0 hover:bg-cream/40"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/accounts/${a.id}`}
                      className="flex items-center gap-2.5"
                    >
                      <AvatarCircle name={a.name} size={26} />
                      <div>
                        <div className="font-medium text-ink">{a.name}</div>
                        {a.banner ? (
                          <div className="font-data text-[10px] uppercase tracking-[0.12em] text-ink-mute">
                            {a.banner}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-data text-ink-soft">
                    {a.doors_count}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {a.location_text ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {STAGE_LABELS[a.stage]}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(a.tags ?? []).slice(0, 3).map((t) => (
                        <Tag key={t} variant="neutral">
                          {t}
                        </Tag>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 font-data text-[10px] font-medium uppercase tracking-[0.18em] text-ink-mute">
      {children}
    </th>
  );
}
