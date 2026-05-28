"use client";

import { Checkbox } from "@/components/ui/checkbox";

interface FieldTabProps {
  isReadonly: boolean;
  onReadonlyChange: (v: boolean) => void;
  isRequired: boolean;
  onRequiredChange: (v: boolean) => void;
  isHidden: boolean;
  onHiddenChange: (v: boolean) => void;
  isSearchable: boolean;
  onSearchableChange: (v: boolean) => void;
  fieldNote: string;
  onFieldNoteChange: (v: string) => void;
}

export default function FieldTab({
  isReadonly,
  onReadonlyChange,
  isRequired,
  onRequiredChange,
  isHidden,
  onHiddenChange,
  isSearchable,
  onSearchableChange,
  fieldNote,
  onFieldNoteChange,
}: FieldTabProps) {
  return (
    <div className="px-5 py-4">
      <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Readonly</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox checked={isReadonly} onCheckedChange={(v) => onReadonlyChange(!!v)} />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Disable the field in the app</span>
          </label>
        </div>

        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Required</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox checked={isRequired} onCheckedChange={(v) => onRequiredChange(!!v)} />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Require value to be set on creation</span>
          </label>
        </div>

        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Hidden</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox checked={isHidden} onCheckedChange={(v) => onHiddenChange(!!v)} />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Hidden on Detail</span>
          </label>
        </div>

        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Searchable</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox checked={isSearchable} onCheckedChange={(v) => onSearchableChange(!!v)} />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Include field in search queries</span>
          </label>
        </div>

        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Note</label>
          <textarea
            value={fieldNote}
            onChange={(e) => onFieldNoteChange(e.target.value)}
            placeholder="Add a helpful note for users..."
            className="flex h-[108px] w-full rounded-md border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}
