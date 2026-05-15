import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { Italic } from "@/components/ui/italic";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/">
          <Wordmark />
        </Link>
        <Link href="/signup" className="text-sm text-ink-soft hover:text-ink">
          New here? <span className="underline-offset-4 hover:underline">Start free</span>
        </Link>
      </header>
      <main className="mx-auto mt-12 max-w-md px-6 sm:mt-24">
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
          Welcome <Italic>back</Italic>.
        </h1>
        <p className="mt-3 text-ink-soft">
          Sign in to your Mango account.
        </p>
        {error ? (
          <p className="mt-4 rounded-md border border-[#E8C2C2] bg-[#FBE5E5] px-3 py-2 text-sm text-[#9b3838]">
            {decodeURIComponent(error)}
          </p>
        ) : null}
        <div className="mt-8">
          <MagicLinkForm ctaLabel="Sign in" />
        </div>
      </main>
    </div>
  );
}
