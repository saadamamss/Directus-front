"use client";

import { X } from "lucide-react";
import { interfacesByType } from "@/features/fields/components/interfaces/interfacesByType";
import DropdownInterfaceForm from "@/features/fields/components/interfaces/DropdownInterfaceForm";
import ColorInterfaceForm from "@/features/fields/components/interfaces/ColorInterfaceForm";
import InputInterfaceForm from "@/features/fields/components/interfaces/InputInterfaceForm";
import O2mInterfaceForm from "@/features/fields/components/interfaces/O2mInterfaceForm";
import M2oInterfaceForm from "@/features/fields/components/interfaces/M2oInterfaceForm";
import M2mInterfaceForm from "@/features/fields/components/interfaces/M2mInterfaceForm";

export default function InterfaceTab({
  rawType,
  selectedInterface,
  onInterfaceChange,
  choices,
  onChoicesChange,
  colors,
  onColorsChange,
  o2mOptions,
  onO2mOptionsChange,
  relation,
  fieldOptions,
  isEditing,
}: {
  rawType: string;
  selectedInterface: string | null;
  onInterfaceChange: (v: string | null) => void;
  choices?: { text: string; value: string }[];
  onChoicesChange?: (items: { text: string; value: string }[]) => void;
  colors?: { name: string; color: string }[];
  onColorsChange?: (c: { name: string; color: string }[]) => void;
  o2mOptions?: { layout: string; displayTemplate?: string; enableCreate?: boolean; enableSelect?: boolean };
  onO2mOptionsChange?: (opts: { layout: string; displayTemplate?: string; enableCreate?: boolean; enableSelect?: boolean }) => void;
  relation: import("@/lib/api/fields").RelationDto | null;
  fieldOptions?: Record<string, unknown>;
  isEditing: boolean;
}) {
  const interfaces = interfacesByType[rawType] || [];
  if (interfaces.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] p-12 text-center mx-6 my-6">
        <p className="text-sm text-[#9CA3AF]">No interfaces available for this type</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-3">
        {interfaces.map((iface) => {
          const isSelected = selectedInterface === iface.value;
          const Icon = iface.icon;
          if (selectedInterface && !isSelected) return null;

          return (
            <div key={iface.value}>
              <button
                type="button"
                onClick={() => onInterfaceChange(isSelected ? null : iface.value)}
                className={`flex w-full items-center gap-4 rounded-md border-2 p-4 text-left transition-colors ${
                  isSelected ? "border-primary bg-[#FEF2F2]" : "border-[#E5E7EB] bg-white hover:border-primary"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F9FAFB]">
                  <Icon className="h-5 w-5 text-[#6B7280]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[#111827]">{iface.title}</div>
                  <div className="text-xs text-[#6B7280]">{iface.subtitle}</div>
                </div>
                {isSelected && (
                  <span
                    onClick={(e) => { e.stopPropagation(); onInterfaceChange(null); }}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </span>
                )}
              </button>
              {isSelected && (
                <div className="mt-3 px-0">
                  {iface.value === "input" || iface.value === "textarea" ? (
                    <InputInterfaceForm
                      defaultPlaceholder={fieldOptions?.placeholder as string}
                      defaultSoftLimit={fieldOptions?.soft_limit != null ? String(fieldOptions.soft_limit) : undefined}
                      defaultTrim={fieldOptions?.trim as boolean}
                    />
                  ) : iface.value === "dropdown" || iface.value === "radio-buttons" ? (
                    <DropdownInterfaceForm initialItems={choices || []} onChange={onChoicesChange} />
                  ) : iface.value === "color" ? (
                    <ColorInterfaceForm initialColors={colors || []} onChange={onColorsChange} />
                  ) : iface.value === "o2m" ? (
                    <O2mInterfaceForm
                      relation={relation}
                      o2mOptions={o2mOptions}
                      onO2mOptionsChange={onO2mOptionsChange}
                    />
                  ) : iface.value === "m2o" ? (
                    <M2oInterfaceForm
                      relation={relation}
                      m2oOptions={{
                        displayTemplate: o2mOptions?.displayTemplate,
                        enableCreate: o2mOptions?.enableCreate,
                        enableSelect: o2mOptions?.enableSelect,
                      }}
                      onM2oOptionsChange={(opts) => {
                        onO2mOptionsChange?.({ layout: o2mOptions?.layout ?? "list", ...opts });
                      }}
                    />
                  ) : iface.value === "m2m" ? (
                    <M2mInterfaceForm
                      relation={relation}
                      m2mOptions={{
                        layout: o2mOptions?.layout ?? "list",
                        displayTemplate: o2mOptions?.displayTemplate,
                        enableCreate: o2mOptions?.enableCreate,
                        enableSelect: o2mOptions?.enableSelect,
                      }}
                      onM2mOptionsChange={(opts) => {
                        onO2mOptionsChange?.({ ...opts });
                      }}
                    />
                  ) : (
                    <div className="rounded-md border-2 border-dashed border-[#E5E7EB] p-6 text-center">
                      <p className="text-sm text-[#9CA3AF]">{iface.title} interface settings — coming soon</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
