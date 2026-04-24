"use client";

import {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  useEffect,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "danger-ghost";

type ButtonSize = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  children,
  disabled,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const cls = [
    "sb-btn",
    `sb-btn--${variant}`,
    `sb-btn--${size}`,
    disabled ? "is-disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {icon && (
        <span className="sb-btn__icon" aria-hidden>
          {icon}
        </span>
      )}
      <span className="sb-btn__label">{children}</span>
    </button>
  );
}

export type TagTone =
  | "default"
  | "work"
  | "health"
  | "learn"
  | "personal"
  | "side";

export function Tag({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: TagTone;
}) {
  return <span className={`sb-tag sb-tag--${tone}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`sb-status sb-status--${status}`}>
      <span className="sb-status__dot" aria-hidden />
      <span className="sb-status__label">{status}</span>
    </span>
  );
}

export function Card({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`sb-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (next: T) => void;
  options: SegmentedOption<T>[];
}) {
  return (
    <div className="sb-seg" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          className={`sb-seg__item${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
          {opt.count != null && (
            <span className="sb-seg__count">{opt.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  children,
  label,
  width = 560,
}: {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  label?: string;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="sb-modal" role="dialog" aria-modal="true" aria-label={label}>
      <div className="sb-modal__scrim" onClick={onClose} />
      <div className="sb-modal__card" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({
  title,
  meta,
  onClose,
}: {
  title: ReactNode;
  meta?: ReactNode;
  onClose?: () => void;
}) {
  return (
    <header className="sb-modal__header">
      <div className="sb-modal__heading">
        {meta && <div className="sb-modal__eyebrow">{meta}</div>}
        <h2 className="sb-modal__title">{title}</h2>
      </div>
      {onClose && (
        <button
          type="button"
          className="sb-iconbtn"
          onClick={onClose}
          aria-label="Close"
        >
          <Icon name="x" />
        </button>
      )}
    </header>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`sb-field ${className}`}>
      <span className="sb-field__label">{label}</span>
      {children}
      {error ? (
        <span className="sb-field__err">{error}</span>
      ) : hint ? (
        <span className="sb-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

export type IconName =
  | "plus"
  | "x"
  | "search"
  | "edit"
  | "trash"
  | "clock"
  | "tag"
  | "arrow-up"
  | "arrow-down"
  | "chevron"
  | "check"
  | "filter"
  | "sparkle"
  | "palette";

export function Icon({ name, size = 14 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "plus":
      return (
        <svg {...common}>
          <path d="M8 3v10M3 8h10" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4" />
          <path d="M10 10l3 3" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M3 13l2-.5L13 4.5 11.5 3 3.5 11 3 13z" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M3 5h10M6 5V3.5h4V5M5 5l.5 8h5L11 5" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="5.5" />
          <path d="M8 5v3l2 1.5" />
        </svg>
      );
    case "tag":
      return (
        <svg {...common}>
          <path d="M3 8V3h5l5 5-5 5-5-5z" />
          <circle cx="5.5" cy="5.5" r=".5" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...common}>
          <path d="M8 13V3M4 7l4-4 4 4" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...common}>
          <path d="M8 3v10M4 9l4 4 4-4" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="M6 4l4 4-4 4" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M3 8.5L6.5 12 13 4.5" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M3 4h10M5 8h6M7 12h2" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M8 3v4M8 9v4M3 8h4M9 8h4" />
        </svg>
      );
    case "palette":
      return (
        <svg {...common}>
          <path d="M8 2a6 6 0 1 0 0 12c1 0 1-1 1-2s1-1 2-1a3 3 0 0 0 3-3 6 6 0 0 0-6-6z" />
          <circle cx="5.5" cy="7" r="0.6" fill="currentColor" />
          <circle cx="8" cy="5" r="0.6" fill="currentColor" />
          <circle cx="10.5" cy="7" r="0.6" fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

export function Brandmark() {
  return (
    <span className="sb-brandmark" aria-hidden>
      <svg
        viewBox="0 0 20 20"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      >
        <rect x="2.5" y="2.5" width="15" height="15" rx="1" />
        <line x1="2.5" y1="7" x2="17.5" y2="7" />
        <line x1="6" y1="2.5" x2="6" y2="17.5" />
        <circle cx="11.5" cy="11" r="0.6" fill="currentColor" />
        <circle cx="13.5" cy="13" r="0.6" fill="currentColor" />
        <circle cx="15" cy="10" r="0.6" fill="currentColor" />
      </svg>
    </span>
  );
}
