"use client";

interface TrackerBoxesProps {
  label: string;
  current: number;
  max: number;
  onToggle: (index: number) => void;
  disabled: boolean;
  variant: "luck" | "harm" | "experience";
}

const variantStyles = {
  luck: {
    filled: "bg-accent border-accent",
    empty: "border-border-light hover:border-accent/50",
    filledDisabled: "bg-accent border-accent",
    emptyDisabled: "border-border",
  },
  harm: {
    filled: "bg-danger border-danger",
    empty: "border-border-light hover:border-danger/50",
    filledDisabled: "bg-danger border-danger",
    emptyDisabled: "border-border",
  },
  experience: {
    filled: "bg-success border-success",
    empty: "border-border-light hover:border-success/50",
    filledDisabled: "bg-success border-success",
    emptyDisabled: "border-border",
  },
};

export function TrackerBoxes({ label, current, max, onToggle, disabled, variant }: TrackerBoxesProps) {
  const styles = variantStyles[variant];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        <span className="text-xs text-muted">{current}/{max}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: max }, (_, i) => {
          const isFilled = i < current;
          let className = "w-6 h-6 rounded border-2 transition-all ";
          if (disabled) {
            className += isFilled ? styles.filledDisabled : styles.emptyDisabled;
            className += " cursor-default";
          } else {
            className += isFilled ? styles.filled : styles.empty;
            className += " cursor-pointer";
          }
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                // Toggle: if clicking the last filled box, unfill it; otherwise fill up to this box
                if (isFilled && i === current - 1) {
                  onToggle(i); // decrement
                } else if (!isFilled) {
                  onToggle(i + 1); // set to i+1
                }
              }}
              className={className}
              aria-label={`${label} ${i + 1} of ${max}`}
            />
          );
        })}
      </div>
    </div>
  );
}
