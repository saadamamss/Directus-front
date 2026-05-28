"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function SchemaTab({
  rawType,
  onTypeChange,
  hideAlias,
  typeDisabled,
  relationConfigured,
  fieldKey,
  onFieldKeyChange,
  fieldLength,
  onFieldLengthChange,
  defaultValue,
  onDefaultValueChange,
  isNullable,
  onIsNullableChange,
  isUnique,
  onIsUniqueChange,
  isIndexed,
  onIsIndexedChange,
}: {
  rawType: string;
  onTypeChange: (t: string) => void;
  hideAlias?: boolean;
  typeDisabled?: boolean;
  relationConfigured?: boolean;
  fieldKey: string;
  onFieldKeyChange: (v: string) => void;
  fieldLength: string;
  onFieldLengthChange: (v: string) => void;
  defaultValue: string;
  onDefaultValueChange: (v: string) => void;
  isNullable: boolean;
  onIsNullableChange: (v: boolean) => void;
  isUnique: boolean;
  onIsUniqueChange: (v: boolean) => void;
  isIndexed: boolean;
  onIsIndexedChange: (v: boolean) => void;
}) {
  const isFloatOrDecimal = rawType === "FLOAT" || rawType === "DECIMAL";
  const isString = rawType === "STRING";
  const isText = rawType === "TEXT";

  return (
    <div className="px-5 py-4">
      <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
            Key <span className="text-primary">*</span>
          </label>
          <Input
            value={fieldKey}
            onChange={(e) => onFieldKeyChange(e.target.value)}
            placeholder="A unique column name..."
          />
          <p className="mt-1 text-xs text-[#9CA3AF]">This field&apos;s database column name and API key</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">
            Type <span className="text-primary">*</span>
          </label>
          <Select value={rawType} onValueChange={onTypeChange} disabled={typeDisabled}>
            <SelectTrigger className={`h-[54px] border-2 border-[#E5E7EB] bg-white text-sm ${typeDisabled ? "cursor-not-allowed opacity-60" : ""}`}>
              {typeDisabled ? (
                <span className="truncate text-[#6B7280]">
                  {rawType === '' ? 'Determined by relation' : rawType}
                </span>
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STRING">String</SelectItem>
              <SelectItem value="TEXT">Text</SelectItem>
              <SelectItem value="INTEGER">Integer</SelectItem>
              <SelectItem value="BIGINT">Big Integer</SelectItem>
              <SelectItem value="FLOAT">Float</SelectItem>
              <SelectItem value="DECIMAL">Decimal</SelectItem>
              <SelectItem value="BOOLEAN">Boolean</SelectItem>
              <SelectItem value="DATE">Date</SelectItem>
              <SelectItem value="UUID">UUID</SelectItem>
              {!hideAlias && <SelectItem value="ALIAS">Alias</SelectItem>}
            </SelectContent>
          </Select>
        </div>

        {!isFloatOrDecimal && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Length</label>
            {isString ? (
              <Input
                value={fieldLength}
                onChange={(e) => onFieldLengthChange(e.target.value)}
                placeholder="255"
                type="number"
              />
            ) : (
              <Input placeholder="Not Available for this Type" disabled className="opacity-60" />
            )}
          </div>
        )}

        {isFloatOrDecimal && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">Precision & Scale</label>
            <div className="flex gap-2">
              <div className="flex-1"><Input id="schema-precision" placeholder="10" /></div>
              <div className="flex-1"><Input id="schema-scale" placeholder="2" /></div>
            </div>
          </div>
        )}

        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-[#111827]">Default Value</label>
          {isText ? (
            <textarea
              value={defaultValue}
              onChange={(e) => onDefaultValueChange(e.target.value)}
              placeholder="NULL"
              className="flex h-[108px] w-full rounded-md border-2 border-[#E5E7EB] bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          ) : (
            <Input
              value={defaultValue}
              onChange={(e) => onDefaultValueChange(e.target.value)}
              placeholder="NULL"
            />
          )}
        </div>

        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Nullable</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox
              checked={isNullable}
              onCheckedChange={(v) => onIsNullableChange(!!v)}
            />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Allow NULL value</span>
          </label>
        </div>

        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Unique</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox
              checked={isUnique}
              onCheckedChange={(v) => onIsUniqueChange(!!v)}
            />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Value has to be unique</span>
          </label>
        </div>

        <div>
          <div className="mb-1.5 block text-sm font-medium text-[#111827]">Index</div>
          <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
            <Checkbox
              checked={isIndexed}
              onCheckedChange={(v) => onIsIndexedChange(!!v)}
            />
            <span className="ml-2 truncate text-sm text-[#6B7280]">Field is indexed</span>
          </label>
        </div>
      </div>
    </div>
  );
}
