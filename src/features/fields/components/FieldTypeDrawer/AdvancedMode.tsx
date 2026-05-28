"use client";

import { Box, Check } from "lucide-react";
import SchemaTab from "./tabs/SchemaTab";
import FieldTab from "./tabs/FieldTab";
import InterfaceTab from "./tabs/InterfaceTab";
import RelationshipTab from "./tabs/RelationshipTab";
import PlaceholderTab from "./tabs/PlaceholderTab";
import type { FieldResponse } from "@/lib/api/fields";
import type { CollectionResponse } from "@/types/api";

export default function AdvancedMode({
  activeTab,
  onTabChange,
  rawType,
  onTypeChange,
  selectedInterface,
  onInterfaceChange,
  choices,
  onChoicesChange,
  colors,
  onColorsChange,
  o2mOptions,
  onO2mOptionsChange,
  relation,
  onRelationChange,
  collectionName,
  editingField,
  onSave,
  tabs,
  allCollections,
  isStandardPreset,
  typeDisabled,
  // Schema state
  fieldKey,
  setFieldKey,
  fieldLength,
  setFieldLength,
  defaultValue,
  setDefaultValue,
  isNullable,
  setIsNullable,
  isUnique,
  setIsUnique,
  isIndexed,
  setIsIndexed,
  setRawType,
  // Field state
  isReadonly,
  setIsReadonly,
  isRequired,
  setIsRequired,
  isHidden,
  setIsHidden,
  isSearchable,
  setIsSearchable,
  fieldNote,
  setFieldNote,
  // Relation handling
  handleRelationChange,
  correspondingField,
  onCorrespondingFieldChange,
}: {
  activeTab: string;
  onTabChange: (t: string) => void;
  rawType: string;
  onTypeChange: (t: string) => void;
  selectedInterface: string | null;
  onInterfaceChange: (v: string | null) => void;
  choices: { text: string; value: string }[];
  onChoicesChange: (items: { text: string; value: string }[]) => void;
  colors: { name: string; color: string }[];
  onColorsChange: (c: { name: string; color: string }[]) => void;
  o2mOptions: { layout: string; displayTemplate?: string; enableCreate?: boolean; enableSelect?: boolean };
  onO2mOptionsChange: (opts: { layout: string; displayTemplate?: string; enableCreate?: boolean; enableSelect?: boolean }) => void;
  relation: import("@/lib/api/fields").RelationDto | null;
  onRelationChange: (r: import("@/lib/api/fields").RelationDto | null) => void;
  collectionName?: string;
  editingField: FieldResponse | null;
  onSave: () => void;
  tabs: string[];
  allCollections: CollectionResponse[];
  isStandardPreset?: boolean;
  typeDisabled?: boolean;
  // Schema state
  fieldKey: string;
  setFieldKey: (v: string) => void;
  fieldLength: string;
  setFieldLength: (v: string) => void;
  defaultValue: string;
  setDefaultValue: (v: string) => void;
  isNullable: boolean;
  setIsNullable: (v: boolean) => void;
  isUnique: boolean;
  setIsUnique: (v: boolean) => void;
  isIndexed: boolean;
  setIsIndexed: (v: boolean) => void;
  setRawType: (value: string) => void;
  // Field state
  isReadonly: boolean;
  setIsReadonly: (v: boolean) => void;
  isRequired: boolean;
  setIsRequired: (v: boolean) => void;
  isHidden: boolean;
  setIsHidden: (v: boolean) => void;
  isSearchable: boolean;
  setIsSearchable: (v: boolean) => void;
  fieldNote: string;
  setFieldNote: (v: string) => void;
  // Relation handling
  handleRelationChange: (r: import("@/lib/api/fields").RelationDto | null) => void;
  correspondingField: { enabled: boolean; fieldKey: string };
  onCorrespondingFieldChange: (v: { enabled: boolean; fieldKey: string }) => void;
}) {
  const tabStyles = (tab: string) =>
    activeTab === tab ? "block" : "hidden";

  return (
    <div className="flex flex-1 min-h-0">
      <div className="w-[198px] shrink-0 bg-[#f0f4f9] border-r border-[#E5E7EB] flex flex-col">
        <nav className="flex-1 p-[10px]">
          <div className="flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => onTabChange(tab)}
                className={`flex h-[32px] w-full items-center rounded-md px-3 text-[13px] font-semibold transition-colors ${
                  activeTab === tab
                    ? "bg-[#E4EAF1] text-black"
                    : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <Box className="h-5 w-5 text-[#475569]" />
            <h2 className="text-[16px] font-bold leading-tight text-[#1E293B]">
              {editingField ? `Edit: ${editingField.field}` : "New Field"}
              {collectionName && <span className="font-normal text-[#64748B]"> ({collectionName})</span>}
            </h2>
          </div>
          <button
            type="button"
            onClick={onSave}
            className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342]"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className={tabStyles("Schema")}>
            <SchemaTab
              rawType={rawType}
              onTypeChange={onTypeChange}
              hideAlias={isStandardPreset}
              typeDisabled={typeDisabled}
              relationConfigured={!!relation?.relatedCollection}
              fieldKey={fieldKey}
              onFieldKeyChange={setFieldKey}
              fieldLength={fieldLength}
              onFieldLengthChange={setFieldLength}
              defaultValue={defaultValue}
              onDefaultValueChange={setDefaultValue}
              isNullable={isNullable}
              onIsNullableChange={setIsNullable}
              isUnique={isUnique}
              onIsUniqueChange={setIsUnique}
              isIndexed={isIndexed}
              onIsIndexedChange={setIsIndexed}
            />
          </div>
          <div className={tabStyles("Field")}>
            <FieldTab
              isReadonly={isReadonly}
              onReadonlyChange={setIsReadonly}
              isRequired={isRequired}
              onRequiredChange={setIsRequired}
              isHidden={isHidden}
              onHiddenChange={setIsHidden}
              isSearchable={isSearchable}
              onSearchableChange={setIsSearchable}
              fieldNote={fieldNote}
              onFieldNoteChange={setFieldNote}
            />
          </div>
          <div className={tabStyles("Interface")}>
            <InterfaceTab
              rawType={rawType}
              selectedInterface={selectedInterface}
              onInterfaceChange={onInterfaceChange}
              choices={choices}
              onChoicesChange={onChoicesChange}
              colors={colors}
              onColorsChange={onColorsChange}
              o2mOptions={o2mOptions}
              onO2mOptionsChange={onO2mOptionsChange}
              relation={relation}
              fieldOptions={editingField?.meta?.options as Record<string, unknown> | undefined}
              isEditing={!!editingField}
            />
          </div>
          <div className={tabStyles("Relationship")}>
            <RelationshipTab
              rawType={rawType}
              selectedInterface={selectedInterface}
              relation={relation}
              onRelationChange={handleRelationChange}
              collectionName={collectionName}
              allCollections={allCollections}
              fieldKey={fieldKey}
              setRawType={setRawType}
              correspondingField={correspondingField}
              onCorrespondingFieldChange={onCorrespondingFieldChange}
              isEditing={!!editingField}
            />
          </div>
          {tabs.filter(t => !["Schema","Field","Interface","Relationship"].includes(t)).map(t => (
            <div key={t} className={tabStyles(t)}>
              <PlaceholderTab label={t} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
