"use client";

type CategoryFilterProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
};

export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  const options = ["All", ...categories];

  return (
    <div className="mb-8 flex flex-wrap gap-1.5">
      {options.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`rounded-md border px-2.5 py-1 text-[13px] font-medium transition-colors duration-200 ${
              isActive
                ? "border-border-hover bg-card text-foreground"
                : "border-transparent text-dim hover:text-muted"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
