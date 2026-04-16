"use client";

import type { ReactNode } from "react";
import { memo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export const CheckboxGroup = memo(function CheckboxGroup({
  groupId,
  options,
  selected,
  onChange,
  t,
  columns = 2,
}: {
  /** Unique per form field — only used for DOM `id` / label `htmlFor`, not submitted values. */
  groupId: string;
  options: readonly string[];
  selected: string[];
  onChange: (updated: string[]) => void;
  t: (key: string) => string;
  columns?: number;
}) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  return (
    <div
      className={`mt-3 grid gap-x-8 gap-y-3.5 ${
        columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "grid-cols-3"
            : "grid-cols-1"
      }`}
    >
      {options.map((option) => {
        const domId = `cb-${groupId}-${option}`;
        return (
          <div key={option} className="flex items-center gap-2.5">
            <Checkbox
              id={domId}
              checked={selected.includes(option)}
              onCheckedChange={() => toggle(option)}
            />
            <Label
              htmlFor={domId}
              className="text-sm font-normal text-foreground"
            >
              {t(option)}
            </Label>
          </div>
        );
      })}
    </div>
  );
});

export const RadioOptionGroup = memo(function RadioOptionGroup({
  name,
  options,
  selected,
  onChange,
  t,
  columns = 2,
}: {
  name: string;
  options: readonly string[];
  selected: string;
  onChange: (value: string) => void;
  t: (key: string) => string;
  columns?: number;
}) {
  return (
    <div
      className={`mt-3 grid gap-x-8 gap-y-3.5 ${
        columns === 2
          ? "grid-cols-2"
          : columns === 3
            ? "grid-cols-3"
            : "grid-cols-1"
      }`}
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2.5">
          <input
            type="radio"
            name={name}
            id={`radio-${name}-${option}`}
            checked={selected === option}
            onChange={() => onChange(option)}
            className="size-4 accent-brand"
          />
          <Label
            htmlFor={`radio-${name}-${option}`}
            className="text-sm font-normal text-foreground"
          >
            {t(option)}
          </Label>
        </div>
      ))}
    </div>
  );
});

export function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between py-2"
      >
        <h2 className="text-xs font-bold tracking-wider text-foreground uppercase">
          {title}
        </h2>
        {open ? (
          <ChevronUp className="size-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-5 text-muted-foreground" />
        )}
      </button>
      {open && <div className="mt-2 pb-4">{children}</div>}
    </div>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-5 mb-1 text-xs font-medium text-muted-foreground first:mt-0">
      {children}
    </h3>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 text-lg font-bold text-foreground">{children}</h2>
  );
}
