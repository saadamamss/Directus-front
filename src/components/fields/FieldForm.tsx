"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { fetchFieldTypes, type FieldType as BackendFieldType } from "@/lib/api/help"

const simpleTypeToValue: Record<string, string> = {
  Input: "STRING",
  Textarea: "TEXT",
  WYSIWYG: "TEXT",
  Toggle: "BOOLEAN",
  Date: "DATE",
  Image: "UUID",
}

const simpleTypeToInterface: Record<string, string | null> = {
  Input: "input",
  Textarea: "textarea",
  WYSIWYG: "wysiwyg",
  Toggle: "toggle",
  Date: null,
  Image: "image",
}

interface FormFieldProps {
  label: React.ReactNode
  htmlFor: string
  children: React.ReactNode
}

function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[#111827]">
        {label}
      </label>
      {children}
    </div>
  )
}

function ToggleField({ label, id }: { label: string; id: string }) {
  return (
    <div>
      <div className="mb-1.5 block text-sm font-medium text-[#111827]">
        {label}
      </div>
      <label
        htmlFor={id}
        className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary"
      >
        <Checkbox id={id} />
        <span className="ml-2 truncate text-sm text-[#6B7280]">{label}</span>
      </label>
    </div>
  )
}

interface FieldFormProps {
  type: string
  collectionName?: string
  onAdvanced?: () => void
  onSave?: (data: Record<string, unknown>) => void
}

export default function FieldForm({ type, collectionName, onAdvanced, onSave }: FieldFormProps) {
  const [keyValue, setKeyValue] = React.useState("")
  const [typeValue, setTypeValue] = React.useState("")
  const [fieldTypes, setFieldTypes] = React.useState<BackendFieldType[]>([])

  React.useEffect(() => {
    fetchFieldTypes().then(setFieldTypes).catch(() => setFieldTypes([]))
  }, [])

  const isValid = keyValue.trim().length > 0 && (type !== "Input" || typeValue.length > 0)

  const handleSave = () => {
    const getVal = (id: string) => (document.getElementById(id) as HTMLInputElement)?.value ?? ""
    const getChecked = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return false;
      return el.getAttribute("data-state") === "checked";
    }

    const key = getVal("field-key")

    const backendValue = type === "Input" ? (typeValue || "STRING") : (simpleTypeToValue[type] || "STRING")
    const backendType = fieldTypes.find(ft => ft.value === backendValue)
    const iface = simpleTypeToInterface[type] ?? undefined
    const defaultValue = getVal("field-default-value")

    const options: Record<string, unknown> = {}

    if (type === "Input" || type === "Textarea") {
      if (getVal("field-placeholder")) options.placeholder = getVal("field-placeholder")
      if (type === "Textarea") {
        const softLimit = parseInt(getVal("field-soft-limit"), 10)
        if (softLimit) options.soft_limit = softLimit
        if (getChecked("field-trim")) options.trim = true
      }
    }

    const data: Record<string, unknown> = {
      collection: collectionName,
      field: key,
      type: backendValue,
      meta: {
        collection: collectionName,
        field: key,
        interface: iface,
        width: "full",
        required: getChecked("field-required") || undefined,
        ...(Object.keys(options).length > 0 ? { options } : {}),
      },
      schema: {
        name: key,
        table: collectionName,
        data_type: backendType?.dbType || backendValue,
        default_value: defaultValue || undefined,
        max_length: backendValue === "STRING" ? 255 : undefined,
        is_nullable: true,
        is_unique: false,
        is_indexed: false,
      },
    }

    console.log("Save Field — collected data:", JSON.stringify(data, null, 2))
    onSave?.(data)

  }

  return (
    <div className="border-t-4 border-[#E5E7EB] bg-[#F9FAFB] px-5 py-4">
      <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
        <FormField label={<>Key <span className="text-primary">*</span></>} htmlFor="field-key">
          <Input id="field-key" placeholder="Enter field key..." value={keyValue} onChange={(e) => setKeyValue(e.target.value)} />
        </FormField>

        {type === "Input" && (
          <>
            <FormField label={<>Type <span className="text-primary">*</span></>} htmlFor="field-type">
              <Select onValueChange={(v) => setTypeValue(v)}>
                <SelectTrigger id="field-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map(ft => (
                    <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Default Value" htmlFor="field-default-value">
              <Input id="field-default-value" placeholder="Null" />
            </FormField>
            <ToggleField label="Required" id="field-required" />
            <FormField label="Placeholder" htmlFor="field-placeholder">
              <Input id="field-placeholder" placeholder="Placeholder text..." />
            </FormField>
          </>
        )}

        {type === "Textarea" && (
          <>
            <FormField label={<>Type <span className="text-primary">*</span></>} htmlFor="field-type">
              <Select defaultValue="TEXT" disabled>
                <SelectTrigger id="field-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm opacity-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Default Value" htmlFor="field-default-value">
              <Input id="field-default-value" placeholder="Null" />
            </FormField>
            <ToggleField label="Required" id="field-required" />
            <FormField label="Placeholder" htmlFor="field-placeholder">
              <Input id="field-placeholder" placeholder="Placeholder text..." />
            </FormField>
            <FormField label="Soft Limit" htmlFor="field-soft-limit">
              <Input id="field-soft-limit" type="number" placeholder="Character limit..." />
            </FormField>
            <ToggleField label="Trim" id="field-trim" />
          </>
        )}

        {type === "WYSIWYG" && (
          <>
            <FormField label={<>Type <span className="text-primary">*</span></>} htmlFor="field-type">
              <Select defaultValue="TEXT" disabled>
                <SelectTrigger id="field-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm opacity-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">Text</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Default Value" htmlFor="field-default-value">
              <Input id="field-default-value" placeholder="Null" />
            </FormField>
            <ToggleField label="Required" id="field-required" />
          </>
        )}

        {type === "Toggle" && (
          <>
            <FormField label={<>Type <span className="text-primary">*</span></>} htmlFor="field-type">
              <Select defaultValue="BOOLEAN" disabled>
                <SelectTrigger id="field-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm opacity-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOOLEAN">Boolean</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <ToggleField label="Default Value" id="field-default-value" />
            <ToggleField label="Required" id="field-required" />
          </>
        )}

        {type === "Date" && (
          <>
            <FormField label={<>Type <span className="text-primary">*</span></>} htmlFor="field-type">
              <Select defaultValue="DATE" disabled>
                <SelectTrigger id="field-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm opacity-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DATE">Date</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <ToggleField label="Required" id="field-required" />
          </>
        )}

        {type === "Image" && (
          <>
            <FormField label={<>Type <span className="text-primary">*</span></>} htmlFor="field-type">
              <Select defaultValue="UUID" disabled>
                <SelectTrigger id="field-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm opacity-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UUID">UUID</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <ToggleField label="Required" id="field-required" />
          </>
        )}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!isValid}
        className="mt-5 flex h-[40px] w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-white transition-colors hover:bg-[#e04342] disabled:opacity-50"
      >
        Save Field
      </button>

      <button
        type="button"
        onClick={() => onAdvanced?.()}
        className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-[#6B7280] transition-colors hover:text-[#111827]"
      >
        Continue in advanced field creation mode
      </button>
    </div>
  )
}
