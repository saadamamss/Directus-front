"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldResponse } from "@/lib/api/fields";
import type { RelationResponse } from "@/lib/api/relations";
import type { CollectionResponse } from "@/types/api";
import TreeNode, { type FieldNode } from "@/shared/ui/tree-select";

function getFieldBranch(
  relations: RelationResponse[],
  fields: FieldResponse[],
  collections: CollectionResponse[],
  collectionName: string,
  parentKey: string = "",
  depth: number = 0,
  maxDepth: number = 15
): FieldNode[] {
  if (depth >= maxDepth) return [];

  const collection = collections.find((c) => c.meta.name === collectionName);
  if (!collection) return [];

  const collectionFields = fields.filter(
    (f) => f.meta.collectionId === collection.meta.id
  );

  return collectionFields.map((field) => {
    const special = field.meta.special ?? "";
    const isRelation = ["m2o", "o2m", "m2m", "files"].includes(special);
    const currentKey = parentKey
      ? `${parentKey}.${field.field}`
      : field.field;

    const node: FieldNode = {
      key: currentKey,
      label: field.meta.label || field.field,
      field: field.field,
      collection: collectionName,
      type: isRelation ? "relation" : "field",
      depth,
      hasChildren: false,
    };

    if (isRelation) {
      node.hasChildren = relations.some(
        (r) =>
          (r.collection === collectionName && r.field === field.field) ||
          (r.meta.oneCollection === collectionName &&
            r.meta.oneField === field.field)
      );
    }

    return node;
  });
}

export default function M2oInterfaceForm({
  relation,
  m2oOptions,
  onM2oOptionsChange,
}: {
  relation: import("@/lib/api/fields").RelationDto | null;
  m2oOptions?: {
    displayTemplate?: string;
    enableCreate?: boolean;
    enableSelect?: boolean;
  };
  onM2oOptionsChange?: (opts: {
    displayTemplate?: string;
    enableCreate?: boolean;
    enableSelect?: boolean;
  }) => void;
}) {
  const [displayOpen, setDisplayOpen] = useState(false);
  const displayRef = useRef<HTMLDivElement>(null);
  const [enableCreate, setEnableCreate] = useState(
    m2oOptions?.enableCreate ?? true
  );
  const [enableSelect, setEnableSelect] = useState(
    m2oOptions?.enableSelect ?? true
  );
  const collections = useAppStore((s) => s.collections);
  const fields = useAppStore((s) => s.fields);
  const relations = useAppStore((s) => s.relations);

  const relatedCollectionName = relation?.relatedCollection || "";

  const treeNodes = useMemo(
    () =>
      relatedCollectionName
        ? getFieldBranch(
            relations,
            fields,
            collections,
            relatedCollectionName,
            "",
            0,
            15
          )
        : [],
    [relatedCollectionName, relations, fields, collections]
  );

  const loadChildren = useCallback(
    (node: FieldNode): FieldNode[] => {
      if (!node.hasChildren) return [];

      let rel = relations.find(
        (r) => r.collection === node.collection && r.field === node.field
      );
      if (rel) {
        return getFieldBranch(
          relations,
          fields,
          collections,
          rel.relatedCollection,
          node.key,
          node.depth + 1,
          15
        );
      }

      rel = relations.find(
        (r) =>
          r.meta.oneCollection === node.collection &&
          r.meta.oneField === node.field
      );
      if (rel) {
        return getFieldBranch(
          relations,
          fields,
          collections,
          rel.collection,
          node.key,
          node.depth + 1,
          15
        );
      }

      return [];
    },
    [relations, fields, collections]
  );

  const existingTemplate = m2oOptions?.displayTemplate || "";
  const initialSelected = useMemo(
    () =>
      new Set(
        existingTemplate
          .match(/\{\{(.+?)\}\}/g)
          ?.map((m) => m.slice(2, -2)) ?? []
      ),
    []
  );

  const [selectedFields, setSelectedFields] =
    useState<Set<string>>(initialSelected);
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const onM2oOptionsChangeRef = useRef(onM2oOptionsChange);
  onM2oOptionsChangeRef.current = onM2oOptionsChange;

  const buildTemplate = (fields: Set<string>) =>
    Array.from(fields)
      .map((f) => `{{${f}}}`)
      .join("");

  useEffect(() => {
    const tpl = buildTemplate(selectedFields);
    onM2oOptionsChangeRef.current?.({
      displayTemplate: tpl || undefined,
      enableCreate,
      enableSelect,
    });
  }, [selectedFields, enableCreate, enableSelect]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (displayRef.current && !displayRef.current.contains(e.target as Node))
        setDisplayOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleField = (key: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#111827]">
          Display Template
        </label>
        <div className="relative" ref={displayRef}>
          <button
            type="button"
            onClick={() => setDisplayOpen(!displayOpen)}
            className="flex h-[54px] w-full items-center justify-between rounded-md border-2 border-[#E5E7EB] bg-white px-3 text-sm focus:border-primary focus:outline-none"
          >
            <span
              className={
                selectedFields.size === 0
                  ? "text-[#9CA3AF]"
                  : "text-[#111827]"
              }
            >
              {selectedFields.size === 0
                ? "Select fields..."
                : `${selectedFields.size} field${
                    selectedFields.size > 1 ? "s" : ""
                  } selected`}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#9CA3AF] transition-transform ${
                displayOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {displayOpen && treeNodes.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-[#E5E7EB] bg-white py-1 shadow-lg max-h-60 overflow-y-auto">
              {treeNodes.map((node) => (
                <TreeNode
                  key={node.key}
                  node={node}
                  depth={0}
                  selectedFields={selectedFields}
                  expandedKeys={expandedKeys}
                  onToggleField={toggleField}
                  onToggleExpand={(key) => {
                    setExpandedKeys((prev) => {
                      const next = new Set(prev);
                      if (next.has(key)) next.delete(key);
                      else next.add(key);
                      return next;
                    });
                  }}
                  loadChildren={loadChildren}
                />
              ))}
            </div>
          )}
          {selectedFields.size > 0 && (
            <div className="mt-1.5 rounded-md bg-[#F9FAFB] px-2.5 py-1 font-mono text-xs text-[#6B7280]">
              {buildTemplate(selectedFields)}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
          <Checkbox checked={enableCreate} onCheckedChange={(checked) => setEnableCreate(checked as boolean)} />
          <span className="ml-2 truncate text-sm text-[#6B7280]">Enable Create button</span>
        </label>
        <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
          <Checkbox checked={enableSelect} onCheckedChange={(checked) => setEnableSelect(checked as boolean)} />
          <span className="ml-2 truncate text-sm text-[#6B7280]">Enable Select button</span>
        </label>
      </div>
    </div>
  );
}
