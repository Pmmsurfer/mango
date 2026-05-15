import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Italic } from "@/components/ui/italic";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/">
          <Wordmark />
        </Link>
        <Link href="/login" className="text-sm text-ink-soft hover:text-ink">
          Already have an account?{" "}
          <span className="underline-offset-4 hover:underline">Sign in</span>
        </Link>
      </header>
      <main className="mx-auto mt-12 grid max-w-5xl gap-12 px-6 sm:mt-24 sm:grid-cols-2">
        <section>
          <p className="font-data text-[11px] uppercase tracking-[0.24em] text-ink-mute">
            Start free · no credit card
          </p>
          <h1 className="mt-5 font-display text-4xl leading-tight text-ink sm:text-5xl">
            The CRM for brands{" "}
            <Italic>in retail</Italic>.
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
            Sign up with your email. We&apos;ll send you a magic link, set up your brand,
            and seed your account with 12 sample retailers so you can see Mango in action
            right away.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink-soft">
            <li className="flex items-start gap-2"><Dot /> 30 days free, then $50/mo</li>
            <li className="flex items-start gap-2"><Dot /> Cancel anytime</li>
            <li className="flex items-start gap-2"><Dot /> Your data stays yours</li>
          </ul>
        </section>
        <section>
          <div className="rounded-xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-display text-2xl text-ink">Create your account</h2>
            <p className="mt-1 text-sm text-ink-mute">
              We&apos;ll email you a sign-in link.
            </p>
            <div className="mt-6">
              <MagicLinkForm ctaLabel="Start free trial" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Dot() {
  return <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mango" aria-hidden />;
}
