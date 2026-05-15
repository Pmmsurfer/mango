import { Tag } from "@/components/ui/tag";
import { AvatarCircle } from "@/components/ui/avatar-circle";

type Card = {
  name: string;
  doors: number;
  location: string;
  tag?: { label: string; variant: "hot" | "warm" | "cold" | "green" | "flag" };
};

const columns: { title: string; count: number; cards: Card[] }[] = [
  {
    title: "Researching",
    count: 3,
    cards: [
      { name: "Pop Up Grocer", doors: 6, location: "Tribeca, NYC", tag: { label: "Warm intro", variant: "warm" } },
      { name: "Citarella", doors: 4, location: "Manhattan" },
    ],
  },
  {
    title: "Pitched",
    count: 2,
    cards: [
      { name: "Foxtrot Chicago", doors: 12, location: "IL", tag: { label: "Hot", variant: "hot" } },
      { name: "Lassens", doors: 10, location: "So Cal" },
    ],
  },
  {
    title: "Approved",
    count: 1,
    cards: [
      { name: "Mom's Organic", doors: 18, location: "DC Metro", tag: { label: "PO out", variant: "green" } },
    ],
  },
  {
    title: "On shelf",
    count: 2,
    cards: [
      { name: "Bristol Farms", doors: 14, location: "Beverly Hills", tag: { label: "Reorder due", variant: "flag" } },
      { name: "Gelson's", doors: 27, location: "So Cal" },
    ],
  },
  {
    title: "Reordering",
    count: 2,
    cards: [
      { name: "Erewhon Calabasas", doors: 1, location: "Calabasas", tag: { label: "Hot", variant: "hot" } },
      { name: "Whole Foods PNW", doors: 42, location: "Pacific NW" },
    ],
  },
];

export function PipelinePreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-surface shadow-[0_24px_60px_-30px_rgba(31,26,18,0.25)]">
      {/* Mock window chrome */}
      <div className="flex items-center justify-between border-b border-line/70 bg-cream/60 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
        </div>
        <span className="font-data text-[10px] text-ink-mute uppercase tracking-[0.2em]">
          mango / pipeline
        </span>
        <span className="w-10" />
      </div>

      <div className="overflow-x-auto p-4 sm:p-5">
        <div className="grid min-w-[820px] grid-cols-5 gap-3">
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between px-1">
                <h4 className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-mute">
                  {col.title}
                </h4>
                <span className="font-data text-[10px] text-ink-mute">
                  {col.count}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {col.cards.map((card) => (
                  <div
                    key={card.name}
                    className="rounded-md border border-line bg-surface px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-medium leading-tight text-ink">
                        {card.name}
                      </span>
                      <AvatarCircle name={card.name} size={20} />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-data text-[10px] text-ink-mute">
                        {card.doors} {card.doors === 1 ? "door" : "doors"} · {card.location}
                      </span>
                    </div>
                    {card.tag ? (
                      <div className="mt-2">
                        <Tag variant={card.tag.variant}>{card.tag.label}</Tag>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
