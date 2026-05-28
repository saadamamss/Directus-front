"use client";

import { useState, useEffect } from "react";
import { ArrowRight, LayoutGrid, FolderOpen } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Combobox from "@/shared/ui/combobox";
import { useAppStore } from "@/stores/appStore";
import type { CollectionResponse } from "@/types/api";

export default function RelationshipTab({
  rawType,
  selectedInterface,
  relation,
  onRelationChange,
  collectionName,
  allCollections,
  fieldKey,
  setRawType,
  correspondingField,
  onCorrespondingFieldChange,
  isEditing,
}: {
  rawType: string;
  selectedInterface: string | null;
  relation: import("@/lib/api/fields").RelationDto | null;
  onRelationChange: (r: import("@/lib/api/fields").RelationDto | null) => void;
  collectionName?: string;
  allCollections: CollectionResponse[];
  fieldKey: string;
  setRawType: (value: string) => void;
  correspondingField: { enabled: boolean; fieldKey: string };
  onCorrespondingFieldChange: (v: { enabled: boolean; fieldKey: string }) => void;
  isEditing: boolean;
}) {
  const [relatedCollection, setRelatedCollection] = useState(
    relation?.relatedCollection || "",
  );
  const [foreignKey, setForeignKey] = useState(relation?.foreignKey || "");
  const [junctionCollection, setJunctionCollection] = useState(
    relation?.junctionCollection || "",
  );
  const [junctionField, setJunctionField] = useState(
    relation?.junctionField || "",
  );
  const [relatedJunctionField, setRelatedJunctionField] = useState(
    relation?.relatedJunctionField || "",
  );
  const [onDeselect, setOnDeselect] = useState(
    relation?.onDeselect || "nullify",
  );
  const [onDelete, setOnDelete] = useState(relation?.onDelete || "SET NULL");
  const [onDeleteRelated, setOnDeleteRelated] = useState("SET NULL");
  const allFields = useAppStore((s) => s.fields);
  const allRelations = useAppStore((s) => s.relations);
  const thisColObj = allCollections.find(
    (c) => c.collection === collectionName,
  );
  const relatedColObj = allCollections.find(
    (c) => c.meta.name === relatedCollection,
  );

  // Find the stored relation record to show schema info when editing
  const storedRelation = relation?.relatedCollection
    ? allRelations.find((r) =>
        r.field === relation.foreignKey &&
        r.relatedCollection === relatedCollection &&
        r.collection === collectionName
      )
    : null;

  useEffect(() => {
    if (relation) {
      setRelatedCollection(relation.relatedCollection || "");
      setForeignKey(relation.foreignKey || "");
      setJunctionCollection(relation.junctionCollection || "");
      setJunctionField(relation.junctionField || "");
      setRelatedJunctionField(relation.relatedJunctionField || "");
      setOnDeselect(relation.onDeselect || "nullify");
      setOnDelete(relation.onDelete || "SET NULL");
    }
  }, [relation]);

  useEffect(() => {
    if (!relatedCollection) return;

    const jc = junctionCollection || `${collectionName}_${relatedCollection}`;
    const jf = junctionField || `${collectionName}_id`;
    const rjf = relatedJunctionField || `${relatedCollection}_id`;

    if (selectedInterface === "m2o") {
      onRelationChange({
        type: "m2o",
        relatedCollection,
        foreignKey: fieldKey,
        onDelete: onDelete || undefined,
      });
    } else if (selectedInterface === "o2m") {
      onRelationChange({
        type: "o2m",
        relatedCollection,
        foreignKey,
        onDeselect,
        onDelete: onDelete || undefined,
      });
    } else if (selectedInterface === "m2m") {
      onRelationChange({
        type: "m2m",
        relatedCollection,
        junctionCollection: jc,
        junctionField: jf,
        relatedJunctionField: rjf,
        onDeselect,
        onDelete: onDelete || undefined,
        onDeleteRelated: onDeleteRelated || undefined,
      });
    }
  }, [
    relatedCollection,
    foreignKey,
    junctionCollection,
    junctionField,
    relatedJunctionField,
    selectedInterface,
    collectionName,
    onRelationChange,
    onDeselect,
    onDelete,
    onDeleteRelated,
    fieldKey,
  ]);

  useEffect(() => {
    if (selectedInterface === "files") onRelationChange(null);
  }, [selectedInterface, onRelationChange]);

  if (!selectedInterface) {
    return (
      <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] p-12 text-center mx-6 my-6">
        <p className="text-sm text-[#9CA3AF]">
          Select a relation interface first
        </p>
      </div>
    );
  }

  if (selectedInterface === "files") {
    return (
      <div className="px-5 py-4">
        <div className="rounded-lg border-2 border-[#E5E7EB] bg-[#F9FAFB] p-5">
          <div className="mb-4 flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-[#6B7280]" />
            <span className="text-sm font-semibold text-[#111827]">
              Files Preset — M2M to file_metas
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-sm">
            <div className="rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-center font-medium text-[#6B7280]">
              {collectionName || "this"}
            </div>
            <ArrowRight className="h-4 w-4 text-[#9CA3AF]" />
            <div className="rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-center font-medium text-[#6B7280]">
              {collectionName ? `${collectionName}_files` : "junction"}
            </div>
            <ArrowRight className="h-4 w-4 text-[#9CA3AF] col-start-2" />
            <div className="rounded-md border border-[#E5E7EB] bg-white px-4 py-3 text-center font-medium text-[#6B7280]">
              file_metas
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#9CA3AF]">
            <span>
              FK: <code className="text-[#6B7280]">{collectionName}_id</code>
            </span>
            <span>
              Related FK: <code className="text-[#6B7280]">file_metas_id</code>
            </span>
          </div>
          <p className="mt-3 text-xs text-[#9CA3AF]">
            All values are auto-configured. No manual setup needed.
          </p>
        </div>
      </div>
    );
  }

  if (selectedInterface === "m2o") {
    return (
      <div className="flex flex-col gap-5 px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              This collection
            </label>
            <div className="flex h-[54px] items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#6B7280]">
              {collectionName || "—"}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              Related Collection
            </label>
            <Select
              value={relatedCollection}
              onValueChange={setRelatedCollection}
            >
              <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                <SelectValue placeholder="Select collection..." />
              </SelectTrigger>
              <SelectContent>
                {allCollections
                  .filter((c) => c.collection !== collectionName)
                  .map((c) => (
                    <SelectItem key={c.collection} value={c.collection}>
                      {c.collection}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              Key
            </label>
            <div className="flex h-[54px] items-center rounded-md border-2 border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
              {fieldKey || "—"}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              Primary Key
            </label>
            <div className="flex h-[54px] items-center gap-2 rounded-md border-2 border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
              <span>{storedRelation?.schema.foreignKeyColumn || relatedColObj?.meta.primaryKey || "id"}</span>
            </div>
          </div>
        </div>
        {!isEditing && (
          <>
            <hr className="border-[#E5E7EB]" />
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Corresponding Field
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={correspondingField.enabled}
                  onChange={(e) => {
                    const next = { ...correspondingField, enabled: e.target.checked };
                    if (e.target.checked && !next.fieldKey) {
                      next.fieldKey = collectionName || "";
                    }
                    onCorrespondingFieldChange(next);
                  }}
                  className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-[#111827]">
                  Create corresponding field in {relatedCollection || "..."}
                </span>
              </label>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                  Field Key
                </label>
                <input
                  type="text"
                  value={correspondingField.fieldKey}
                  onChange={(e) => onCorrespondingFieldChange({ ...correspondingField, fieldKey: e.target.value })}
                  disabled={!correspondingField.enabled}
                  placeholder={collectionName || "field_name"}
                  className={`h-[44px] w-full rounded-md border-2 bg-white px-3 text-sm focus:border-primary focus:outline-none ${
                    correspondingField.enabled
                      ? "border-[#E5E7EB]"
                      : "border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]"
                  }`}
                />
              </div>
            </div>
          </>
        )}
        <hr className="border-[#E5E7EB]" />
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Relational Trigger
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              On Delete of {relatedCollection || "related"}
            </label>
            <Select value={onDelete} onValueChange={setOnDelete}>
              <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SET NULL">Nullify (Set NULL)</SelectItem>
                <SelectItem value="CASCADE">Cascade</SelectItem>
                <SelectItem value="RESTRICT">RESTRICT</SelectItem>
                <SelectItem value="NO ACTION">No Action</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  }

  if (selectedInterface === "o2m") {
    return (
      <div className="flex flex-col gap-5 px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              This collection
            </label>
            <div className="flex h-[54px] items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 text-sm font-medium text-[#6B7280]">
              {collectionName || "—"}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              Related Collection
            </label>
            <Select
              value={relatedCollection}
              onValueChange={setRelatedCollection}
            >
              <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                <SelectValue placeholder="Select collection..." />
              </SelectTrigger>
              <SelectContent>
                {allCollections
                  .filter((c) => c.collection !== collectionName)
                  .map((c) => (
                    <SelectItem key={c.collection} value={c.collection}>
                      {c.collection}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              Reference Key
            </label>
            <div className="flex h-[54px] items-center rounded-md border-2 border-[#E5E7EB] bg-[#F9FAFB] px-3 text-sm text-[#6B7280]">
              id
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              FK
            </label>
            <Combobox
              value={foreignKey}
              onChange={setForeignKey}
              placeholder={`${collectionName}_id`}
              options={
                relatedCollection
                  ? allFields
                      .filter(
                        (f) => f.meta.collectionId === relatedColObj?.meta.id,
                      )
                      .map((f) => ({ value: f.field, label: f.field }))
                  : []
              }
            />
          </div>
        </div>
        <hr className="border-[#E5E7EB]" />
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Relational Trigger
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                On Deselect of {relatedCollection || "..."}
              </label>
              <Select value={onDeselect} onValueChange={setOnDeselect}>
                <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nullify">Nullify</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                On Delete of {relatedCollection || "related"} 
              </label>
              <Select value={onDelete} onValueChange={setOnDelete}>
                <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SET NULL">Nullify (Set NULL)</SelectItem>
                  <SelectItem value="CASCADE">Cascade</SelectItem>
                  <SelectItem value="RESTRICT">Restrict</SelectItem>
                  <SelectItem value="NO ACTION">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedInterface === "m2m") {
    return (
      <div className="flex flex-col gap-5 px-5 py-4">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-[#6B7280]" />
          <span className="text-sm font-semibold text-[#111827]">
            Many to Many
          </span>
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 text-sm">
            {/* Row 1 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">This Collection</label>
              <div className="flex h-[44px] items-center rounded-md border border-[#E5E7EB] bg-white px-3 font-medium text-[#6B7280]">
                {collectionName || "—"}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Junction Table</label>
              <input
                type="text"
                value={junctionCollection}
                onChange={(e) => setJunctionCollection(e.target.value)}
                placeholder={relatedCollection ? `${collectionName}_${relatedCollection}` : `${collectionName}_related`}
                className="h-[44px] w-full rounded-md border-2 border-[#E5E7EB] bg-white px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Related Collection</label>
              <Select
                value={relatedCollection}
                onValueChange={setRelatedCollection}
              >
                <SelectTrigger className="h-[44px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue placeholder="Select collection..." />
                </SelectTrigger>
                <SelectContent>
                  {allCollections
                    .filter((c) => c.collection !== collectionName)
                    .map((c) => (
                      <SelectItem key={c.collection} value={c.collection}>
                        {c.collection}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2 */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">PK of This</label>
              <div className="flex h-[44px] items-center rounded-md border border-[#E5E7EB] bg-white px-3 font-medium text-[#6B7280]">
                {thisColObj?.meta.primaryKey || "id"}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">FK Value</label>
              <input
                type="text"
                value={junctionField}
                onChange={(e) => setJunctionField(e.target.value)}
                placeholder={`${collectionName}_id`}
                className="h-[44px] w-full rounded-md border-2 border-[#E5E7EB] bg-white px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>{/* empty */}</div>

            {/* Row 3 */}
            <div>{/* empty */}</div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">Related FK Value</label>
              <input
                type="text"
                value={relatedJunctionField}
                onChange={(e) => setRelatedJunctionField(e.target.value)}
                placeholder={relatedCollection ? `${relatedCollection}_id` : "related_id"}
                className="h-[44px] w-full rounded-md border-2 border-[#E5E7EB] bg-white px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#6B7280]">PK of Related</label>
              <div className="flex h-[44px] items-center rounded-md border border-[#E5E7EB] bg-white px-3 font-medium text-[#6B7280]">
                {relatedColObj?.meta.primaryKey || "id"}
              </div>
            </div>
        </div>
        {!isEditing && (
          <>
            <hr className="border-[#E5E7EB]" />
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                Corresponding Field
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={correspondingField.enabled}
                  onChange={(e) => {
                    const next = { ...correspondingField, enabled: e.target.checked };
                    if (e.target.checked && !next.fieldKey) {
                      next.fieldKey = collectionName || "";
                    }
                    onCorrespondingFieldChange(next);
                  }}
                  className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-[#111827]">
                  Create corresponding field in {relatedCollection || "..."}
                </span>
              </label>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                  Field Key
                </label>
                <input
                  type="text"
                  value={correspondingField.fieldKey}
                  onChange={(e) => onCorrespondingFieldChange({ ...correspondingField, fieldKey: e.target.value })}
                  disabled={!correspondingField.enabled}
                  placeholder={collectionName || "field_name"}
                  className={`h-[44px] w-full rounded-md border-2 bg-white px-3 text-sm focus:border-primary focus:outline-none ${
                    correspondingField.enabled
                      ? "border-[#E5E7EB]"
                      : "border-[#E5E7EB] bg-[#F9FAFB] text-[#9CA3AF]"
                  }`}
                />
              </div>
            </div>
          </>
        )}
        <hr className="border-[#E5E7EB]" />
        <div className="space-y-3">
          <div className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
            Relational Trigger
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                On Deselect of {junctionCollection || "junction"}
              </label>
              <Select value={onDeselect} onValueChange={setOnDeselect}>
                <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nullify">Nullify</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                On Delete of {collectionName || "this"}
              </label>
              <Select value={onDelete} onValueChange={setOnDelete}>
                <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SET NULL">Nullify (Set NULL)</SelectItem>
                  <SelectItem value="CASCADE">Cascade</SelectItem>
                  <SelectItem value="RESTRICT">Restrict</SelectItem>
                  <SelectItem value="NO ACTION">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#111827]">
                On Delete of {relatedCollection || "related"}
              </label>
              <Select value={onDeleteRelated} onValueChange={setOnDeleteRelated}>
                <SelectTrigger className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SET NULL">Nullify (Set NULL)</SelectItem>
                  <SelectItem value="CASCADE">Cascade</SelectItem>
                  <SelectItem value="RESTRICT">Restrict</SelectItem>
                  <SelectItem value="NO ACTION">No Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-[#E5E7EB] p-12 text-center mx-6 my-6">
      <p className="text-sm text-[#9CA3AF]">
        Select a relation interface first
      </p>
    </div>
  );
}
