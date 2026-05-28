"use client";

import { ChevronDown, Check } from "lucide-react";
import { useRef } from "react";

export type FieldNode = {
  key: string;
  label: string;
  field: string;
  collection: string;
  type: "field" | "relation";
  depth: number;
  hasChildren: boolean;
};

export default function TreeNode({
  node,
  depth,
  selectedFields,
  expandedKeys,
  onToggleField,
  onToggleExpand,
  loadChildren,
}: {
  node: FieldNode;
  depth: number;
  selectedFields: Set<string>;
  expandedKeys: Set<string>;
  onToggleField: (key: string) => void;
  onToggleExpand: (key: string) => void;
  loadChildren: (node: FieldNode) => FieldNode[];
}) {
  const lazyChildrenRef = useRef<FieldNode[] | null>(null);
  const isExpanded = expandedKeys.has(node.key);
  const isSelected = selectedFields.has(node.key);

  if (isExpanded && node.hasChildren && lazyChildrenRef.current === null) {
    lazyChildrenRef.current = loadChildren(node);
  }

  const children = lazyChildrenRef.current ?? [];
  const indent = depth * 16;

  return (
    <div>
      <div className="flex items-center" style={{ paddingLeft: indent }}>
        {node.hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.key)}
            className="flex h-9 w-6 items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] shrink-0"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "" : "-rotate-90"}`} />
          </button>
        ) : (
          <div className="w-6 shrink-0" />
        )}
        <button
          type="button"
          onClick={() => onToggleField(node.key)}
          className={`flex flex-1 items-center gap-2 py-1.5 pr-3 text-sm transition-colors hover:bg-[#F9FAFB] ${
            isSelected ? "font-medium text-primary" : "text-[#111827]"
          }`}
        >
          <div className={`flex h-4 w-4 items-center justify-center rounded border ${
            isSelected ? "border-primary bg-primary" : "border-[#CBD5E1]"
          }`}>
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
          {node.label}
        </button>
      </div>
      {isExpanded && children.length > 0 && (
        <div className="ml-4 border-l border-[#E5E7EB]">
          {children.map((child) => (
            <TreeNode
              key={child.key}
              node={child}
              depth={depth + 1}
              selectedFields={selectedFields}
              expandedKeys={expandedKeys}
              onToggleField={onToggleField}
              onToggleExpand={onToggleExpand}
              loadChildren={loadChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}
