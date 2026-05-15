import { createClient } from "@/lib/supabase/server";
import { PipelineBoard } from "@/components/pipeline/board";
import { PipelineTopBar } from "@/components/pipeline/pipeline-top-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { NewAccountDialog } from "@/components/account/new-account-dialog";
import type { Account } from "@/lib/types";

export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string; region?: string }>;

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { q, region } = await searchParams;
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, brand_id, name, doors_count, location_text, region, tags, banner, stage, notes, created_at, updated_at")
    .order("updated_at", { ascending: false });

  const list = (accounts ?? []) as Account[];
  const regions = Array.from(
    new Set(list.map((a) => a.region).filter(Boolean) as string[])
  ).sort();

  return (
    <>
      <PipelineTopBar totalCount={list.length} regions={regions} />
      <div className="flex-1 px-6 py-6">
        {list.length === 0 ? (
          <EmptyState
            title="No accounts yet"
            description="Add your first retail account to start building your pipeline."
            action={
              <NewAccountDialog
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-full bg-mango px-4 py-2 text-sm font-medium text-white transition hover:bg-mango-deep">
                    + New account
                  </button>
                }
              />
            }
          />
        ) : (
          <PipelineBoard initialAccounts={list} query={q} region={region} />
        )}
      </div>
    </>
  );
}
