import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-narrow flex flex-col items-start py-20 sm:py-24">
      <p className="text-[13px] font-medium text-dim">404</p>
      <h1 className="font-heading mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        That page doesn&apos;t exist or the project slug is wrong.
      </p>
      <Link
        href="/"
        className="mt-6 text-[13px] font-medium text-muted transition-colors duration-200 hover:text-accent"
      >
        ← Back home
      </Link>
    </div>
  );
}
