"use client";

import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export type SegmentedToggleButtonProps = Readonly<
  Omit<ComponentPropsWithoutRef<"div">, "onChange"> & {
    options?: readonly string[];
    defaultIndex?: number;
    onChange?: (index: number, value: string) => void;
  }
>;

export const SegmentedToggleButton = forwardRef<HTMLDivElement, SegmentedToggleButtonProps>(
  ({ className, options = ["Day", "Week", "Month"], defaultIndex = 0, onChange, ...props }, ref) => {
    const [active, setActive] = useState(defaultIndex);
    const count = options.length;
    const safeActive = Math.min(Math.max(active, 0), Math.max(count - 1, 0));

    const select = (index: number) => {
      setActive(index);
      onChange?.(index, options[index] ?? "");
    };

    return (
      <div
        ref={ref}
        role="tablist"
        className={cn(
          "relative inline-flex items-center gap-1 rounded-xl p-1 font-mono text-[10px] font-bold uppercase tracking-widest select-none",
          className,
        )}
        style={{
          background: "var(--bg-sunken)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)",
        }}
        {...props}
      >
        {options.map((option, index) => {
          const isSelected = safeActive === index;
          return (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(index)}
              className={cn(
                "relative z-10 cursor-pointer rounded-lg px-3.5 py-1.5 text-center whitespace-nowrap outline-none transition-all duration-200",
                isSelected
                  ? "font-bold shadow-sm"
                  : "hover:text-white"
              )}
              style={{
                background: isSelected ? "var(--bg-overlay)" : "transparent",
                border: isSelected ? "1px solid var(--border-default)" : "1px solid transparent",
                color: isSelected ? "var(--ink)" : "var(--ink-faint)",
                boxShadow: isSelected ? "0 1px 2px rgba(0,0,0,0.25)" : "none",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    );
  },
);

SegmentedToggleButton.displayName = "SegmentedToggleButton";
