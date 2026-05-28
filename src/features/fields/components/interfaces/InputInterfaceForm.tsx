"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function InputInterfaceForm({
  defaultPlaceholder,
  defaultSoftLimit,
  defaultTrim,
}: {
  defaultPlaceholder?: string;
  defaultSoftLimit?: string;
  defaultTrim?: boolean;
}) {
  return (
    <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
      <div className="col-span-2">
        <label htmlFor="iface-placeholder" className="mb-1.5 block text-sm font-medium text-[#111827]">Placeholder</label>
        <Input id="iface-placeholder" defaultValue={defaultPlaceholder ?? ""} placeholder="Placeholder text..." />
      </div>
      <div>
        <div className="mb-1.5 block text-sm font-medium text-[#111827]">Trim</div>
        <label
          htmlFor="iface-trim"
          className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary"
        >
          <Checkbox id="iface-trim" defaultChecked={defaultTrim} />
          <span className="ml-2 truncate text-sm text-[#6B7280]">Trim whitespace</span>
        </label>
      </div>
      <div>
        <label htmlFor="iface-soft-limit" className="mb-1.5 block text-sm font-medium text-[#111827]">Soft Limit</label>
        <Input id="iface-soft-limit" defaultValue={defaultSoftLimit ?? ""} type="number" placeholder="Character limit..." />
      </div>
    </div>
  );
}
