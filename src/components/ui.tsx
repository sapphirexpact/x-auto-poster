"use client";

import React from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "accent";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-300",
    secondary:
      "bg-stone-100 text-stone-800 hover:bg-stone-200 disabled:opacity-50",
    ghost: "bg-transparent text-stone-700 hover:bg-stone-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    accent: "bg-teal-700 text-white hover:bg-teal-800",
  };
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Banner({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: "info" | "warn" | "error" | "success";
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-950",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    error: "border-rose-300 bg-rose-50 text-rose-950",
    success: "border-teal-200 bg-teal-50 text-teal-950",
  };
  return (
    <div
      role="status"
      className={cx(
        "mb-4 flex flex-col gap-2 rounded-2xl border p-3 sm:flex-row sm:items-center sm:justify-between",
        tones[tone],
      )}
    >
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {children ? <div className="mt-0.5 text-sm opacity-90">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-700">
      {children}
      {hint ? <span className="ml-1 font-normal text-stone-400">{hint}</span> : null}
    </label>
  );
}

export function TextArea({
  id,
  value,
  onChange,
  maxLength = 280,
  placeholder,
  rows = 4,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-900 outline-none ring-teal-600/30 placeholder:text-stone-400 focus:bg-white focus:ring-2"
      />
      <div className="mt-1 flex justify-end text-xs text-stone-400">
        {value.length}/{maxLength}
      </div>
    </div>
  );
}

export function Input({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none ring-teal-600/30 focus:bg-white focus:ring-2"
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl py-1 text-left"
    >
      <span>
        <span className="block text-sm font-medium text-stone-800">{label}</span>
        {description ? (
          <span className="block text-xs text-stone-500">{description}</span>
        ) : null}
      </span>
      <span
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          checked ? "bg-teal-600" : "bg-stone-300",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
            checked ? "left-5" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center text-sm text-stone-500">
      {children}
    </p>
  );
}

export function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-700",
    good: "bg-teal-50 text-teal-800",
    warn: "bg-amber-50 text-amber-800",
    bad: "bg-rose-50 text-rose-800",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
