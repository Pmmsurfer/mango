"use client";

import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { AccountCard } from "@/components/account/account-card";
import { PIPELINE_STAGES, STAGE_LABELS, type Account, type AccountStage } from "@/lib/types";
import { moveAccountStage } from "@/app/actions/accounts";
import { cn } from "@/lib/utils";

type AccountLite = Pick<
  Account,
  "id" | "name" | "doors_count" | "location_text" | "tags" | "banner" | "stage"
>;

export function PipelineBoard({
  initialAccounts,
  query,
  region,
}: {
  initialAccounts: AccountLite[];
  query?: string;
  region?: string;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let list = accounts;
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.location_text ?? "").toLowerCase().includes(q) ||
          (a.banner ?? "").toLowerCase().includes(q)
      );
    }
    if (region && region !== "all") {
      list = list.filter((a) => a.location_text?.includes(region) || false);
    }
    return list;
  }, [accounts, query, region]);

  const byStage = useMemo(() => {
    const map = new Map<AccountStage, AccountLite[]>();
    PIPELINE_STAGES.forEach((s) => map.set(s, []));
    filtered.forEach((a) => {
      if (a.stage === "lost") return;
      map.get(a.stage)?.push(a);
    });
    return map;
  }, [filtered]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const activeCard = activeId ? accounts.find((a) => a.id === activeId) : null;

  function handleStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleEnd(e: DragEndEvent) {
    setActiveId(null);
    if (!e.over) return;
    const accountId = String(e.active.id);
    const targetStage = String(e.over.id) as AccountStage;
    const account = accounts.find((a) => a.id === accountId);
    if (!account || account.stage === targetStage) return;
    if (!PIPELINE_STAGES.includes(targetStage)) return;

    // Optimistic update.
    setAccounts((prev) =>
      prev.map((a) => (a.id === accountId ? { ...a, stage: targetStage } : a))
    );
    startTransition(async () => {
      const res = await moveAccountStage({ id: accountId, stage: targetStage });
      if (!res.ok) {
        // Revert on failure.
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === accountId ? { ...a, stage: account.stage } : a
          )
        );
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleStart} onDragEnd={handleEnd}>
      <div className="overflow-x-auto">
        <div className="grid min-w-[1080px] grid-cols-5 gap-3">
          {PIPELINE_STAGES.map((stage) => (
            <Column
              key={stage}
              stage={stage}
              accounts={byStage.get(stage) ?? []}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeCard ? (
          <div className="rotate-1 opacity-90 shadow-lg">
            <AccountCard account={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  stage,
  accounts,
}: {
  stage: AccountStage;
  accounts: AccountLite[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[400px] flex-col gap-2 rounded-lg p-2 transition",
        isOver ? "bg-mango/5 ring-1 ring-mango/30" : "bg-transparent"
      )}
    >
      <div className="flex items-baseline justify-between px-1.5 pt-1">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-mute">
          {STAGE_LABELS[stage]}
        </h3>
        <span className="font-data text-[10px] text-ink-mute">
          {accounts.length}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {accounts.length === 0 ? (
          <div className="rounded-md border border-dashed border-line bg-surface/40 px-3 py-6 text-center font-data text-[10px] uppercase tracking-[0.18em] text-ink-mute">
            empty
          </div>
        ) : (
          accounts.map((a) => <DraggableCard key={a.id} account={a} />)
        )}
      </div>
    </div>
  );
}

function DraggableCard({ account }: { account: AccountLite }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: account.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(isDragging && "opacity-30")}
    >
      <AccountCard account={account} draggable />
    </div>
  );
}
