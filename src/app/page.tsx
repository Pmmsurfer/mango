import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Italic } from "@/components/ui/italic";
import { PipelinePreview } from "@/components/landing/pipeline-preview";
import { ArrowRight, MoveHorizontal, UserRound, Radar } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Wordmark />
        <nav className="hidden items-center gap-8 text-sm text-ink-soft sm:flex">
          <a href="#features" className="hover:text-ink">Features</a>
          <a href="#pricing" className="hover:text-ink">Pricing</a>
          <Link
            href="/login"
            className="hover:text-ink"
          >
            Sign in
          </Link>
        </nav>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream transition hover:bg-mango-deep sm:hidden"
        >
          Start
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="pt-12 sm:pt-20">
          <p className="font-data text-[11px] uppercase tracking-[0.24em] text-ink-mute">
            For founders selling into retail
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight text-ink sm:text-7xl">
            The CRM for brands{" "}
            <Italic>in retail</Italic>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            Every door. Every buyer. Every reorder. Every follow-up you said
            you&apos;d send last Tuesday — kept in one quiet place, so you can stop
            living in a spreadsheet and start showing up{" "}
            <Italic>before</Italic> the reorder is late.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-mango px-5 py-3 text-[15px] font-medium text-white transition hover:bg-mango-deep"
            >
              Start free trial
              <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline"
            >
              Or sign in
            </Link>
            <span className="font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              30 days free · no credit card
            </span>
          </div>
        </section>

        {/* Pipeline preview */}
        <section className="mt-16 sm:mt-20">
          <PipelinePreview />
        </section>

        {/* Features */}
        <section id="features" className="mt-24 sm:mt-32">
          <p className="font-data text-[11px] uppercase tracking-[0.24em] text-ink-mute">
            What you get
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-ink sm:text-5xl">
            Built for the way <Italic>retail</Italic> actually works.
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <FeatureCard
              icon={<MoveHorizontal className="size-5 text-mango" />}
              title="Pipeline by door"
              body="Researching, pitched, approved, on shelf, reordering. Drag accounts across the board — Mango logs the move so you don't have to."
            />
            <FeatureCard
              icon={<UserRound className="size-5 text-mango" />}
              title={
                <>
                  Buyers, not stores —{" "}
                  <Italic className="text-mango">people</Italic>.
                </>
              }
              body="Track the buyer at Erewhon, not just the banner. When they move to Sprouts, your relationship moves with them."
            />
            <FeatureCard
              icon={<Radar className="size-5 text-mango" />}
              title="Reorder radar"
              body="We learn each account's cadence, then flag the ones slipping past it. Catch the silent fade before it costs you the door."
            />
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-24 sm:mt-32">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="grid gap-0 sm:grid-cols-[1.2fr_1fr]">
              <div className="p-8 sm:p-12">
                <p className="font-data text-[11px] uppercase tracking-[0.24em] text-ink-mute">
                  Pricing
                </p>
                <h3 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
                  One plan. Built for one founder, or a tiny team.
                </h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                  No seats, no tiers, no &quot;contact sales.&quot; Just Mango.
                </p>
                <ul className="mt-6 space-y-2 text-[14px] text-ink-soft">
                  <li className="flex items-start gap-2">
                    <Dot /> Unlimited accounts, buyers, interactions
                  </li>
                  <li className="flex items-start gap-2">
                    <Dot /> Reorder radar across every door
                  </li>
                  <li className="flex items-start gap-2">
                    <Dot /> Drag-and-drop pipeline
                  </li>
                  <li className="flex items-start gap-2">
                    <Dot /> Cancel anytime
                  </li>
                </ul>
              </div>
              <div className="flex flex-col justify-between border-t border-line bg-cream/60 p-8 sm:border-l sm:border-t-0 sm:p-12">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-6xl text-ink">$50</span>
                    <span className="text-sm text-ink-mute">/ month</span>
                  </div>
                  <p className="mt-2 font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
                    30 days free · no credit card
                  </p>
                </div>
                <Link
                  href="/signup"
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-mango px-5 py-3 text-[15px] font-medium text-white transition hover:bg-mango-deep"
                >
                  Start free trial
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-24 border-t border-line py-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Wordmark size={22} />
            <p className="font-data text-[11px] uppercase tracking-[0.18em] text-ink-mute">
              © Mango · made for brands in retail
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 transition hover:border-mango/40">
      <div className="flex size-9 items-center justify-center rounded-lg bg-mango/10">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-2xl leading-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}

function Dot() {
  return (
    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mango" aria-hidden />
  );
}
