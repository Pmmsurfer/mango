export type AccountStage =
  | "researching"
  | "pitched"
  | "approved"
  | "on_shelf"
  | "reordering"
  | "lost";

export type InteractionType =
  | "email"
  | "call"
  | "meeting"
  | "sample"
  | "reorder"
  | "pitch"
  | "note"
  | "job_change";

export const STAGE_LABELS: Record<AccountStage, string> = {
  researching: "Researching",
  pitched: "Pitched",
  approved: "Approved",
  on_shelf: "On shelf",
  reordering: "Reordering",
  lost: "Lost",
};

export const PIPELINE_STAGES: AccountStage[] = [
  "researching",
  "pitched",
  "approved",
  "on_shelf",
  "reordering",
];

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  email: "Email",
  call: "Call",
  meeting: "Meeting",
  sample: "Sample",
  reorder: "Reorder",
  pitch: "Pitch",
  note: "Note",
  job_change: "Buyer changed jobs",
};

export type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  owner_user_id: string;
  created_at: string;
};

export type Account = {
  id: string;
  brand_id: string;
  name: string;
  banner: string | null;
  location_text: string | null;
  region: string | null;
  doors_count: number;
  stage: AccountStage;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Buyer = {
  id: string;
  account_id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
};

export type Interaction = {
  id: string;
  account_id: string;
  buyer_id: string | null;
  type: InteractionType;
  occurred_at: string;
  summary: string | null;
  created_by: string | null;
  created_at: string;
};

export type Reorder = {
  id: string;
  account_id: string;
  occurred_at: string;
  units: number | null;
  dollars: number | null;
  notes: string | null;
  created_at: string;
};

export type Reminder = {
  id: string;
  account_id: string;
  due_date: string;
  label: string;
  completed: boolean;
  created_at: string;
};
