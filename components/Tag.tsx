type TagProps = {
  children: React.ReactNode;
  className?: string;
};

export function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-border bg-background-secondary px-2 py-0.5 text-[12px] font-medium text-muted ${className}`}
    >
      {children}
    </span>
  );
}
