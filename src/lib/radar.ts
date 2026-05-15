import type { Account, Reorder } from "./types";

export type RadarStatus = "on_track" | "slipping" | "at_risk" | "lost";

export const STATUS_LABEL: Record<RadarStatus, string> = {
  on_track: "On track",
  slipping: "Slipping",
  at_risk: "At risk",
  lost: "Drifting",
};

export const STATUS_VARIANT: Record<RadarStatus, "green" | "warm" | "flag" | "cold"> = {
  on_track: "green",
  slipping: "warm",
  at_risk: "flag",
  lost: "cold",
};

export type RadarRow = {
  account: Account;
  cadenceDays: number | null;
  daysSinceReorder: number | null;
  ratio: number | null;
  status: RadarStatus;
  lastReorderAt: string | null;
  reorderCount: number;
};

const DAY = 86400000;

export function buildRadar(
  accounts: Account[],
  reordersByAccount: Map<string, Reorder[]>
): RadarRow[] {
  const now = Date.now();
  const rows: RadarRow[] = [];

  for (const a of accounts) {
    if (a.stage !== "on_shelf" && a.stage !== "reordering") continue;

    const reorders = (reordersByAccount.get(a.id) ?? []).slice().sort(
      (x, y) => new Date(x.occurred_at).getTime() - new Date(y.occurred_at).getTime()
    );

    let cadenceDays: number | null = null;
    if (reorders.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < reorders.length; i++) {
        gaps.push(
          (new Date(reorders[i].occurred_at).getTime() -
            new Date(reorders[i - 1].occurred_at).getTime()) /
            DAY
        );
      }
      cadenceDays = Math.round(gaps.reduce((s, x) => s + x, 0) / gaps.length);
    }

    const last = reorders[reorders.length - 1];
    const daysSinceReorder = last
      ? Math.floor((now - new Date(last.occurred_at).getTime()) / DAY)
      : null;

    let ratio: number | null = null;
    let status: RadarStatus = "on_track";
    if (cadenceDays && daysSinceReorder !== null && cadenceDays > 0) {
      ratio = daysSinceReorder / cadenceDays;
      if (ratio < 1.2) status = "on_track";
      else if (ratio < 1.5) status = "slipping";
      else if (ratio < 2.0) status = "at_risk";
      else status = "lost";
    } else if (!cadenceDays) {
      // Not enough reorders to compute cadence; treat as on_track baseline.
      status = "on_track";
    }

    rows.push({
      account: a,
      cadenceDays,
      daysSinceReorder,
      ratio,
      status,
      lastReorderAt: last?.occurred_at ?? null,
      reorderCount: reorders.length,
    });
  }

  const urgencyOrder: Record<RadarStatus, number> = {
    lost: 0,
    at_risk: 1,
    slipping: 2,
    on_track: 3,
  };

  rows.sort((a, b) => {
    if (urgencyOrder[a.status] !== urgencyOrder[b.status]) {
      return urgencyOrder[a.status] - urgencyOrder[b.status];
    }
    return (b.ratio ?? 0) - (a.ratio ?? 0);
  });

  return rows;
}
