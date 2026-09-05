"use client";

type CategoryOption = {
  key: string;
  label: string;
};

type CategoryFilterProps = {
  options: CategoryOption[];
  active: string;
  onChange: (key: string) => void;
};

export function CategoryFilter({
  options,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="mb-8 flex flex-wrap gap-1.5">
      {options.map((option) => {
        const isActive = active === option.key;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`rounded-md border px-2.5 py-1 text-[13px] font-medium transition-colors duration-200 ${
              isActive
                ? "border-border-hover bg-card text-foreground"
                : "border-transparent text-dim hover:text-muted"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
