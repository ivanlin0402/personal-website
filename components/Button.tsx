import Link from "next/link";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  external?: boolean;
};

const variants = {
  primary:
    "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "bg-transparent text-foreground border border-border hover:border-border-hover hover:bg-card",
  ghost: "text-muted hover:text-foreground",
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  external = false,
}: ButtonProps) {
  const classes = `inline-flex h-9 items-center justify-center rounded-[9px] px-4 text-[13px] font-medium transition-colors duration-200 ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
