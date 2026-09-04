import { Button } from "@/components/Button";

type CTASectionProps = {
  title: string;
  description?: string;
  buttonLabel: string;
  buttonHref: string;
};

export function CTASection({
  title,
  description,
  buttonLabel,
  buttonHref,
}: CTASectionProps) {
  return (
    <section className="border-t border-border pt-12 text-center sm:pt-14">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      <div className="mt-6">
        <Button href={buttonHref} variant="secondary">
          {buttonLabel}
        </Button>
      </div>
    </section>
  );
}
