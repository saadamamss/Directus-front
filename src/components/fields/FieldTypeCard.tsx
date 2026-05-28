"use client"

import { cn } from "@/lib/utils"

const wireframes: Record<string, (selected?: boolean) => React.ReactNode> = {
  Input: () => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
      <rect x="0.5" y="0.5" width="47" height="23" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="8" width="20" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  ),
  "Autocomplete Input": () => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
      <rect x="0.5" y="0.5" width="47" height="23" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="8" width="14" height="2" rx="1" fill="#CBD5E1" />
      <rect x="33" y="6" width="12" height="12" rx="6" fill="#E2E8F0" />
      <path d="M37 12L41 12M39 10L39 14" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  Code: () => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
      <rect x="0.5" y="0.5" width="47" height="23" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="6" width="14" height="1.5" rx="0.75" fill="#A78BFA" />
      <rect x="4" y="10" width="24" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="4" y="14" width="18" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="28" y="6" width="4" height="1.5" rx="0.75" fill="#A78BFA" />
    </svg>
  ),
  Textarea: () => (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="8" width="22" height="2" rx="1" fill="#CBD5E1" />
      <rect x="4" y="14" width="30" height="2" rx="1" fill="#CBD5E1" />
      <rect x="4" y="20" width="16" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  ),
  WYSIWYG: () => (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
      <rect x="0.5" y="0.5" width="47" height="4.5" rx="2.25" stroke="#CBD5E1" />
      <rect x="1.5" y="1.5" width="45" height="2.5" rx="1.25" fill="#F8FAFC" />
      <rect x="3" y="2" width="12" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="18" y="2" width="8" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="29" y="2" width="6" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="0.5" y="5.5" width="47" height="26" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="11" width="20" height="2" rx="1" fill="#CBD5E1" />
      <rect x="4" y="17" width="30" height="2" rx="1" fill="#CBD5E1" />
      <rect x="4" y="23" width="14" height="2" rx="1" fill="#CBD5E1" />
    </svg>
  ),
  Markdown: () => (
    <svg width="48" height="30" viewBox="0 0 48 30" fill="none">
      <rect x="0.5" y="0.5" width="47" height="29" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="8" width="10" height="2" rx="1" fill="#A78BFA" />
      <rect x="4" y="14" width="18" height="2" rx="1" fill="#CBD5E1" />
      <rect x="4" y="20" width="14" height="2" rx="1" fill="#CBD5E1" />
      <text x="32" y="20" fontSize="10" fill="#A78BFA" fontWeight="bold" fontFamily="monospace">M</text>
    </svg>
  ),
  Tags: () => (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
      <rect x="0.5" y="0.5" width="47" height="13" rx="3.5" stroke="#CBD5E1" />
      <rect x="4" y="5" width="12" height="2" rx="1" fill="#CBD5E1" />
      <rect x="6" y="18" width="20" height="8" rx="4" fill="#DDD6FE" />
      <rect x="30" y="18" width="14" height="8" rx="4" fill="#DDD6FE" />
      <text x="10" y="24" fontSize="6" fill="#7C3AED" fontWeight="600" fontFamily="sans-serif">tag1</text>
      <text x="33" y="24" fontSize="6" fill="#7C3AED" fontWeight="600" fontFamily="sans-serif">tag2</text>
    </svg>
  ),
  Toggle: () => (
    <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
      <rect x="0.5" y="0.5" width="47" height="19" rx="9.5" stroke="#CBD5E1" />
      <rect x="0.5" y="0.5" width="29" height="19" rx="9.5" fill="#DDD6FE" />
      <circle cx="27" cy="10" r="7" fill="white" stroke="#CBD5E1" />
      <rect x="34" y="6" width="8" height="2" rx="1" fill="#CBD5E1" />
      <rect x="34" y="12" width="6" height="1.5" rx="0.75" fill="#CBD5E1" />
    </svg>
  ),
  Datetime: () => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
      <rect x="0.5" y="0.5" width="47" height="23" rx="3.5" stroke="#CBD5E1" />
      <rect x="1.5" y="3.5" width="45" height="4" rx="1.5" fill="#F8FAFC" />
      <rect x="5" y="4" width="14" height="2.5" rx="1.25" stroke="#CBD5E1" strokeWidth="0.5" />
      <rect x="4" y="11" width="24" height="2" rx="1" fill="#CBD5E1" />
      <rect x="4" y="16" width="16" height="1.5" rx="0.75" fill="#CBD5E1" />
      <circle cx="38" cy="16" r="6" fill="#DDD6FE" />
      <rect x="36.5" y="15" width="3" height="0.5" rx="0.25" fill="#7C3AED" />
      <rect x="38" y="13.5" width="0.5" height="3" rx="0.25" fill="#7C3AED" />
    </svg>
  ),
  Repeater: () => (
    <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
      <rect x="0.5" y="0.5" width="47" height="7" rx="2.5" stroke="#CBD5E1" />
      <rect x="4" y="2.5" width="18" height="2" rx="1" fill="#CBD5E1" />
      <rect x="36" y="2" width="8" height="3" rx="1.5" fill="#DDD6FE" />
      <text x="38" y="4.5" fontSize="4" fill="#7C3AED" fontWeight="bold">+</text>
      <rect x="0.5" y="10.5" width="47" height="7" rx="2.5" stroke="#CBD5E1" />
      <rect x="4" y="12.5" width="22" height="2" rx="1" fill="#CBD5E1" />
      <rect x="0.5" y="20.5" width="47" height="7" rx="2.5" stroke="#CBD5E1" />
      <rect x="4" y="22.5" width="14" height="2" rx="1" fill="#CBD5E1" />
      <path d="M40 14L43 17M43 14L40 17" stroke="#CBD5E1" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  Map: () => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
      <rect x="0.5" y="0.5" width="47" height="23" rx="3.5" stroke="#CBD5E1" />
      <circle cx="24" cy="12" r="3" fill="#DDD6FE" />
      <circle cx="24" cy="12" r="1.5" fill="#7C3AED" />
      <rect x="10" y="8" width="4" height="1.5" rx="0.75" fill="#CBD5E1" />
      <rect x="32" y="14" width="6" height="1.5" rx="0.75" fill="#CBD5E1" />
    </svg>
  ),
}

interface FieldTypeCardProps {
  label: string
  selected?: boolean
  onClick?: () => void
}

export default function FieldTypeCard({ label, selected, onClick }: FieldTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex cursor-pointer flex-col items-center rounded-lg border-2 px-3 py-4 text-center transition-all",
        selected
          ? "border-primary bg-[#FEF2F2] shadow-[0_0_0_3px_rgba(242,84,83,0.1)]"
          : "border-[#E2E8F0] bg-white hover:border-primary hover:shadow-[0_0_0_3px_rgba(242,84,83,0.1)]"
      )}
    >
      <div className="flex items-center justify-center" style={{ minHeight: 32 }}>
        {wireframes[label]?.(!!selected)}
      </div>
      <span className="mt-3 text-xs font-medium text-[#475569]">{label}</span>
    </button>
  )
}
