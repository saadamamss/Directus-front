"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function DropdownInterfaceForm({
  initialItems = [],
  onChange,
}: {
  initialItems?: { text: string; value: string }[];
  onChange?: (items: { text: string; value: string }[]) => void;
}) {
  const [items, setItems] = useState<{ text: string; value: string }[]>(initialItems);
  const [showAdd, setShowAdd] = useState(false);
  const [text, setText] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    onChange?.(items);
  }, [items, onChange]);

  const handleAdd = () => {
    if (!text.trim() || !value.trim()) return;
    setItems((prev) => [...prev, { text: text.trim(), value: value.trim() }]);
    setText("");
    setValue("");
    setShowAdd(false);
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#111827]">Choices</span>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex h-[32px] items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-white transition-colors hover:bg-[#e04342]"
          >
            + Create New Item
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4 rounded-md border-2 border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
            <div>
              <label htmlFor="dropdown-text" className="mb-1.5 block text-sm font-medium text-[#111827]">Text</label>
              <Input id="dropdown-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Display text..." />
            </div>
            <div>
              <label htmlFor="dropdown-value" className="mb-1.5 block text-sm font-medium text-[#111827]">Value</label>
              <Input id="dropdown-value" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Stored value..." />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex h-[32px] items-center rounded-md bg-primary px-4 text-xs font-medium text-white transition-colors hover:bg-[#e04342]"
            >
              Add Item
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setText(""); setValue(""); }}
              className="flex h-[32px] items-center rounded-md border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !showAdd && (
        <div className="rounded-md border-2 border-dashed border-[#E5E7EB] p-6 text-center">
          <p className="text-sm text-[#9CA3AF]">No items yet. Click above to add choices.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-1">
          {items.map((item, index) => (
            <div key={index} className="flex h-[40px] items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-[#111827]">{item.text}</span>
                <span className="text-xs text-[#9CA3AF]">{item.value}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="flex h-6 w-6 items-center justify-center rounded text-[#9CA3AF] transition-colors hover:text-red-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
