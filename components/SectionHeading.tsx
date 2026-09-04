type SectionHeadingProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  title,
  description,
  align = "left",
  className = "",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`mb-8 max-w-2xl ${alignment} ${className}`}>
      <h2 className="font-heading text-[1.75rem] font-semibold tracking-tight text-foreground sm:text-[1.875rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2.5 text-base leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
