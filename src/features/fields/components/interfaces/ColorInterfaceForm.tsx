"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ColorInterfaceForm({
  initialColors = [],
  onChange,
}: {
  initialColors?: { name: string; color: string }[];
  onChange?: (colors: { name: string; color: string }[]) => void;
}) {
  const [colors, setColors] = useState<{ name: string; color: string }[]>(initialColors);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    onChange?.(colors);
  }, [colors, onChange]);

  const handleAdd = () => {
    if (!name.trim()) return;
    setColors((prev) => [...prev, { name: name.trim(), color }]);
    setName("");
    setColor("#000000");
    setShowAdd(false);
  };

  const handleRemove = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#111827]">Colors</span>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex h-[32px] items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-white transition-colors hover:bg-[#e04342]"
          >
            + Create New Color
          </button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4 rounded-md border-2 border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
            <div>
              <label htmlFor="color-name" className="mb-1.5 block text-sm font-medium text-[#111827]">Name</label>
              <Input id="color-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Color name..." />
            </div>
            <div>
              <label htmlFor="color-picker" className="mb-1.5 block text-sm font-medium text-[#111827]">Color</label>
              <div className="flex h-[54px] items-center gap-3 rounded-md border-2 border-[#E5E7EB] bg-white px-3">
                <input
                  id="color-picker"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-[#E5E7EB] bg-transparent p-0.5"
                />
                <span className="text-sm text-[#6B7280]">{color}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAdd}
              className="flex h-[32px] items-center rounded-md bg-primary px-4 text-xs font-medium text-white transition-colors hover:bg-[#e04342]"
            >
              Add Color
            </button>
            <button
              type="button"
              onClick={() => { setShowAdd(false); setName(""); setColor("#000000"); }}
              className="flex h-[32px] items-center rounded-md border border-[#E5E7EB] bg-white px-4 text-xs font-medium text-[#6B7280] transition-colors hover:bg-[#F9FAFB]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {colors.length === 0 && !showAdd && (
        <div className="rounded-md border-2 border-dashed border-[#E5E7EB] p-6 text-center">
          <p className="text-sm text-[#9CA3AF]">No colors yet. Click above to add presets.</p>
        </div>
      )}

      {colors.length > 0 && (
        <div className="flex flex-col gap-1">
          {colors.map((item, index) => (
            <div key={index} className="flex h-[40px] items-center justify-between rounded-md border border-[#E5E7EB] bg-white px-4">
              <div className="flex items-center gap-3">
                <span className="h-5 w-5 rounded-full border border-[#E5E7EB]" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-[#111827]">{item.name}</span>
                <span className="text-xs text-[#9CA3AF]">{item.color}</span>
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
