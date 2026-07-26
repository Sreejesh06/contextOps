"use client";

import { forwardRef, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function buildMonthCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  return cells;
}

function isSameDay(a: Date, year: number, month: number, day: number) {
  return (
    a.getFullYear() === year && a.getMonth() === month && a.getDate() === day
  );
}

export type MonthPickerCalendarProps = Readonly<
  Omit<ComponentPropsWithoutRef<"div">, "onSelect"> & {
    defaultYear?: number;
    defaultMonth?: number;
    defaultSelectedDay?: number;
    onSelect?: (date: Date) => void;
  }
>;

export const MonthPickerCalendar = forwardRef<HTMLDivElement, MonthPickerCalendarProps>(
  ({ className, defaultYear, defaultMonth, defaultSelectedDay, onSelect, ...props }, ref) => {
    const today = useMemo(() => new Date(), []);
    const [viewYear, setViewYear] = useState(defaultYear ?? today.getFullYear());
    const [viewMonth, setViewMonth] = useState(defaultMonth ?? today.getMonth());
    const [selectedDay, setSelectedDay] = useState(defaultSelectedDay ?? today.getDate());
    const [slideDirection, setSlideDirection] = useState(0);

    const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth]);

    const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const shiftMonth = (delta: number) => {
      setSlideDirection(delta);
      const next = new Date(viewYear, viewMonth + delta, 1);
      setViewYear(next.getFullYear());
      setViewMonth(next.getMonth());
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      setSelectedDay((day) => Math.min(day, lastDay));
    };

    const selectDay = (day: number) => {
      setSelectedDay(day);
      onSelect?.(new Date(viewYear, viewMonth, day));
    };

    return (
      <div
        ref={ref}
        className={cn(
          "w-72 overflow-hidden rounded-2xl p-4 font-sans shadow-2xl select-none",
          className
        )}
        style={{
          background: "var(--bg-base)",
          border: "1px solid var(--border-subtle)",
        }}
        {...props}
      >
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ease-out active:scale-95"
            style={{ color: "var(--ink-muted)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-overlay)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>

          <p className="text-sm font-semibold transition-all duration-300" style={{ color: "var(--ink)" }}>
            {monthLabel}
          </p>

          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="flex size-8 cursor-pointer items-center justify-center rounded-lg transition-all duration-200 ease-out active:scale-95"
            style={{ color: "var(--ink-muted)" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-overlay)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 text-center text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
          {WEEKDAYS.map((label, index) => (
            <span key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1 transition-all duration-300">
          {cells.map((day, index) => {
            if (day === null) {
              return <span key={`empty-${index}`} className="h-9" />;
            }

            const isToday = isSameDay(today, viewYear, viewMonth, day);
            const isSelected = day === selectedDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={cn(
                  "mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xs font-mono transition-all duration-200 ease-out active:scale-95",
                  isSelected ? "scale-100 font-semibold" : "hover:bg-neutral-800",
                )}
                style={{
                  background: isSelected ? "var(--ink)" : "transparent",
                  color: isSelected ? "var(--bg-base)" : "var(--ink-soft)",
                  border: (isToday && !isSelected) ? "1px solid var(--border-default)" : "1px solid transparent",
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  },
);

MonthPickerCalendar.displayName = "MonthPickerCalendar";
