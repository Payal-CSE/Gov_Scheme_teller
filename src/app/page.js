import Link from "next/link";
import { ArrowRight, Shield, Search, BookmarkCheck } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-foreground">
            Gov Scheme Teller
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Find Government Schemes You Qualify For
        </h2>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Answer a few questions about yourself and discover Central and State
          government schemes tailored to your eligibility profile.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover cursor-pointer"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 px-4 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Smart Matching
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our eligibility engine matches your profile against hundreds of
              government schemes automatically.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Verified Schemes
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              All schemes are verified and curated from official government
              sources with direct application links.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookmarkCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              Save and Track
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Bookmark schemes of interest and revisit them anytime from your
              personal dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
        Gov Scheme Teller - India Government Scheme Eligibility Platform
      </footer>
    </div>
  );
}
