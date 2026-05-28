"use client";

export default function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] p-12 text-center mx-6 my-6">
      <p className="text-sm text-[#9CA3AF]">{label} — coming soon</p>
    </div>
  );
}
