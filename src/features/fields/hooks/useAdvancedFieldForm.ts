"use client";

import { useState, useEffect, useCallback } from "react";
import type { FieldResponse, RelationDto } from "@/lib/api/fields";
import type { FieldType as BackendFieldType } from "@/lib/api/help";
import { useAppStore } from "@/stores/appStore";
import type { CreationPreset } from "@/features/fields/components/FieldTypeDrawer";

export function useAdvancedFieldForm(
  editingField: FieldResponse | null,
  fieldTypes: BackendFieldType[],
  collectionName?: string,
  preset?: CreationPreset,
) {
  const [activeTab, setActiveTab] = useState("Schema");
  const [rawType, setRawType] = useState((editingField?.type as string) || "STRING");
  const [selectedInterface, setSelectedInterface] = useState<string | null>(
    ((editingField?.meta as Record<string, unknown> | undefined)?.interface as string) ||
      null,
  );
  const metaOptions = (editingField?.meta as Record<string, unknown> | undefined)
    ?.options as Record<string, unknown> | undefined;
  const metaSpecial = (editingField?.meta as Record<string, unknown> | undefined)
    ?.special as string | null;

  // Schema state
  const [fieldKey, setFieldKey] = useState("");
  const [fieldLength, setFieldLength] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [isNullable, setIsNullable] = useState(true);
  const [isUnique, setIsUnique] = useState(false);
  const [isIndexed, setIsIndexed] = useState(false);

  // Field (meta) state
  const [isReadonly, setIsReadonly] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isSearchable, setIsSearchable] = useState(false);
  const [fieldNote, setFieldNote] = useState("");

  const [choices, setChoices] = useState<{ text: string; value: string }[]>(
    Array.isArray(metaOptions?.choices)
      ? (metaOptions?.choices as { text: string; value: string }[])
      : [],
  );
  const [colors, setColors] = useState<{ name: string; color: string }[]>(
    Array.isArray(metaOptions?.colors)
      ? (metaOptions?.colors as { name: string; color: string }[])
      : [],
  );
  const [o2mOptions, setO2mOptions] = useState<{
    layout: string;
    displayTemplate?: string;
    enableCreate?: boolean;
    enableSelect?: boolean;
  }>({
    layout: (metaOptions?.layout as string) || "list",
    displayTemplate: metaOptions?.displayTemplate as string | undefined,
    enableCreate: metaOptions?.enableCreate as boolean | undefined,
    enableSelect: metaOptions?.enableSelect as boolean | undefined,
  });
  const [relation, setRelation] = useState<
    import("@/lib/api/fields").RelationDto | null
  >(null);
  const [correspondingField, setCorrespondingField] = useState<{
    enabled: boolean;
    fieldKey: string;
  }>({ enabled: false, fieldKey: "" });

  const syncFormFromField = (field: FieldResponse | null) => {
    setActiveTab("Schema");
    setRawType((field?.type as string) || "STRING");
    const fieldMeta = field?.meta as Record<string, unknown> | undefined;
    const storedInterface = (fieldMeta?.interface as string) || null;
    const opts = fieldMeta?.options as Record<string, unknown> | null;
    setChoices(
      Array.isArray(opts?.choices)
        ? (opts?.choices as { text: string; value: string }[])
        : [],
    );
    setColors(
      Array.isArray(opts?.colors)
        ? (opts?.colors as { name: string; color: string }[])
        : [],
    );

    if (!field) {
      setFieldKey("");
      setFieldLength("");
      setDefaultValue("");
      setIsNullable(true);
      setIsUnique(false);
      setIsIndexed(false);
      setIsReadonly(false);
      setIsRequired(false);
      setIsHidden(false);
      setIsSearchable(false);
      setFieldNote("");
      // Reset other states
      setSelectedInterface(null);
      setO2mOptions({
        layout: (metaOptions?.layout as string) || "list",
        displayTemplate: metaOptions?.displayTemplate as string | undefined,
        enableCreate: metaOptions?.enableCreate as boolean | undefined,
        enableSelect: metaOptions?.enableSelect as boolean | undefined,
      });
      setRelation(null);
      return;
    }

    // Populate schema state
    setFieldKey(field.field || "");
    setFieldLength(field.schema?.maxLength ? String(field.schema.maxLength) : "");
    setDefaultValue(field.schema?.defaultValue ?? "");
    setIsNullable(field.schema?.isNullable ?? true);
    setIsUnique(field.schema?.isUnique ?? false);
    setIsIndexed(field.schema?.isIndexed ?? false);

    // Populate field (meta) state
    setIsReadonly(field.meta?.readonly ?? false);
    setIsRequired(field.meta?.required ?? false);
    setIsHidden(field.meta?.hidden ?? false);
    setIsSearchable(field.meta?.searchable ?? false);
    setFieldNote(field.meta?.note ?? "");

    const fieldName = field?.field as string;
    const colName = field?.collection as string;
    const store = useAppStore.getState();
    const currentCol = store.collections.find((c) => c.meta.name === colName);
    const tableName = currentCol?.meta.tableName;

    const findRelation = (): import("@/lib/api/fields").RelationDto | null => {
      if (!tableName || !fieldName) return null;
      const special = fieldMeta?.special as string | null;

      if (special === "o2m") {
        const rel = store.relations.find(
          (r) =>
            r.meta.oneCollection === tableName && r.meta.oneField === fieldName,
        );
        if (!rel) return { type: "o2m", relatedCollection: "" };
        const relatedCol = store.collections.find(
          (c) => c.meta.tableName === rel.meta.manyCollection,
        );
        return {
          type: "o2m",
          relatedCollection: relatedCol?.meta.name || rel.collection,
          foreignKey: rel.meta.manyField,
          onDeselect: rel.meta.oneDeselectAction ?? undefined,
          onDelete: rel.schema.onDelete ?? undefined,
        };
      }
      if (special === "m2o") {
        const rel = store.relations.find(
          (r) =>
            r.meta.manyCollection === tableName &&
            r.meta.manyField === fieldName,
        );
        if (!rel) return { type: "m2o", relatedCollection: "" };
        const relatedCol = store.collections.find(
          (c) => c.meta.tableName === rel.meta.oneCollection,
        );
        return {
          type: "m2o",
          relatedCollection: relatedCol?.meta.name || rel.relatedCollection,
          foreignKey: rel.meta.manyField,
          onDeselect: rel.meta.oneDeselectAction ?? undefined,
          onDelete: rel.schema.onDelete ?? undefined,
        };
      }
      if (special === "m2m") {
        const rel = store.relations.find(
          (r) =>
            r.meta.oneCollection === tableName && r.meta.oneField === fieldName,
        );
        if (!rel) return { type: "m2m", relatedCollection: "" };
        const otherRel = store.relations.find(
          (r) =>
            r.meta.manyCollection === rel.meta.manyCollection &&
            r.field !== rel.field,
        );
        return {
          type: "m2m",
          relatedCollection: otherRel?.relatedCollection || "",
          junctionCollection: rel.schema.junctionCollection ?? undefined,
          junctionField: rel.schema.junctionField ?? undefined,
          relatedJunctionField: rel.schema.relatedJunctionField ?? undefined,
        };
      }
      return null;
    };

    const special = fieldMeta?.special as string | null;

    if (storedInterface === "list-o2m" || storedInterface === "table-o2m") {
      setSelectedInterface("o2m");
      setO2mOptions({
        layout: storedInterface === "table-o2m" ? "table" : "list",
        displayTemplate: opts?.displayTemplate as string | undefined,
      });
      setRelation(findRelation());
    } else if (special === "m2o" && (!storedInterface || storedInterface === "select-dropdown-m2o")) {
      setSelectedInterface("m2o");
      setO2mOptions({
        layout: "list",
        displayTemplate: opts?.displayTemplate as string | undefined,
        enableCreate: opts?.enableCreate as boolean | undefined,
        enableSelect: opts?.enableSelect as boolean | undefined,
      });
      setRelation(findRelation());
    } else if (special === "m2m" && (!storedInterface || storedInterface === "list-m2m" || storedInterface === "table-m2m")) {
      setSelectedInterface("m2m");
      setO2mOptions({
        layout: storedInterface === "table-m2m" ? "table" : "list",
        displayTemplate: opts?.displayTemplate as string | undefined,
        enableCreate: opts?.enableCreate as boolean | undefined,
        enableSelect: opts?.enableSelect as boolean | undefined,
      });
      setRelation(findRelation());
    } else if (special === "files" && !storedInterface) {
      setSelectedInterface("files");
      setO2mOptions({ layout: "list", displayTemplate: undefined });
      setRelation(null);
    } else {
      setSelectedInterface(storedInterface);
      setO2mOptions({
        layout: (opts?.layout as string) || "list",
        displayTemplate: opts?.displayTemplate as string | undefined,
      });
      setRelation(findRelation());
    }
  };

  const handleRelationChange = useCallback((r: RelationDto | null) => {
    setRelation(r);
  }, []);

  const resetForm = () => syncFormFromField(null);

  const applyPreset = (p: CreationPreset) => {
    switch (p) {
      case 'standard':
        setRawType('STRING');
        setSelectedInterface('input');
        setActiveTab('Schema');
        setRelation(null);
        break;
      case 'single-file':
        setRawType('UUID');
        setSelectedInterface('image');
        setActiveTab('Interface');
        setRelation(null);
        break;
      case 'multiple-file':
        setRawType('ALIAS');
        setSelectedInterface('files');
        setActiveTab('Relationship');
        setRelation({ type: 'm2m', relatedCollection: 'file_metas', junctionCollection: '', junctionField: '', relatedJunctionField: '' });
        break;
      case 'm2o':
        setRawType(''); // Empty indicates "determined by relation"
        setSelectedInterface('m2o');
        setActiveTab('Relationship');
        setRelation({ type: 'm2o', relatedCollection: '' });
        break;
      case 'o2m':
        setRawType('ALIAS');
        setSelectedInterface('o2m');
        setActiveTab('Relationship');
        setRelation({ type: 'o2m', relatedCollection: '' });
        break;
      case 'm2m':
        setRawType('ALIAS');
        setSelectedInterface('m2m');
        setActiveTab('Relationship');
        setRelation({ type: 'm2m', relatedCollection: '' });
        break;
    }
  };

  useEffect(() => {
    syncFormFromField(editingField);
  }, [editingField?.meta?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!editingField && preset) {
      applyPreset(preset);
    }
  }, [preset, editingField]);

  useEffect(() => {
    if (
      selectedInterface === "o2m" ||
      selectedInterface === "m2m" ||
      selectedInterface === "files"
    ) {
      setRawType("ALIAS");
    }
  }, [selectedInterface]);    // When related collection changes for M2O, sync type to match the collection's PK type
  useEffect(() => {
    if (selectedInterface === "m2o") {
      if (relation?.relatedCollection) {
        const store = useAppStore.getState();
        const relatedCol = store.collections.find(
          (c) =>
            c.meta.name === relation.relatedCollection ||
            c.collection === relation.relatedCollection,
        );
        if (relatedCol?.meta.pkType) {
          const pkType = relatedCol.meta.pkType.toLowerCase();
          const typeMap: Record<string, string> = {
            "auto-increment": "BIGINT",
            uuid: "UUID",
            string: "STRING",
          };
          setRawType(typeMap[pkType] || "BIGINT");
        }
      } else {
        // Reset rawType when no related collection is selected
        // This allows UI to show "determined by relation" placeholder
        setRawType("");
      }
    }
  }, [selectedInterface, relation?.relatedCollection]);

  const isStandardPreset = preset === 'standard';
  const isM2O = selectedInterface === "m2o";
  const handleTypeChange = (t: string) => {
    if (!isM2O) setRawType(t);
  };

  const tabs = [
    "Schema",
    "Field",
    "Interface",
    ...(isStandardPreset ? [] : ["Relationship"]),
    "Display",
    "Validation",
    "Conditions",
  ];

  const getVal = (id: string) =>
    (document.getElementById(id) as HTMLInputElement)?.value ?? "";
  const getChecked = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    return el.getAttribute("data-state") === "checked";
  };

  const buildPayload = () => {
    // The key: for m2o the key is the FK, otherwise it's fieldKey
    const key =
      selectedInterface === "m2o"
        ? (relation?.foreignKey || fieldKey || "")
        : (fieldKey || (editingField?.field as string) || "");

    const backendValue = rawType || "STRING";
    const backendType = fieldTypes.find((ft) => ft.value === backendValue);
    const iface = selectedInterface ?? undefined;
    const options: Record<string, unknown> = {};

    // Interface options (these still come from DOM for now as they're in Interface tab)
    if (selectedInterface === "input" || selectedInterface === "textarea") {
      options.placeholder = getVal("iface-placeholder") || undefined;
      options.soft_limit =
        parseInt(getVal("iface-soft-limit"), 10) || undefined;
      if (getChecked("iface-trim")) options.trim = true;
    }
    if (
      selectedInterface === "dropdown" ||
      selectedInterface === "radio-buttons"
    ) {
      if (choices.length > 0) options.choices = choices;
    }
    if (selectedInterface === "color") {
      if (colors.length > 0) options.colors = colors;
    }
    if (selectedInterface === "o2m") {
      const ifaceLayout =
        o2mOptions.layout === "table" ? "table-o2m" : "list-o2m";
      if (o2mOptions.displayTemplate)
        options.displayTemplate = o2mOptions.displayTemplate;
      options.enableCreate = true;
      options.enableSelect = true;
      const payload: Record<string, unknown> = {
        field: key,
        type: backendValue,
        ...(editingField ? { label: key } : {}),
        meta: {
          interface: ifaceLayout,
          width: "full" as const,
          readonly: isReadonly || undefined,
          hidden: isHidden || undefined,
          required: isRequired || undefined,
          searchable: isSearchable || undefined,
          note: fieldNote || undefined,
          ...(Object.keys(options).length > 0 ? { options } : {}),
        },
        schema: {
          name: key,
          table: collectionName,
          dataType: backendType?.dbType || backendValue,
          defaultValue: defaultValue || undefined,
          maxLength:
            backendValue === "STRING"
              ? (parseInt(fieldLength, 10) || undefined)
              : undefined,
          isNullable,
          isUnique,
          isIndexed,
        },
      };
      if (relation) payload.relation = relation;
      return payload;
    }

    if (selectedInterface === "m2o") {
      if (o2mOptions.displayTemplate)
        options.displayTemplate = o2mOptions.displayTemplate;
      if (o2mOptions.enableCreate !== undefined)
        options.enableCreate = o2mOptions.enableCreate;
      if (o2mOptions.enableSelect !== undefined)
        options.enableSelect = o2mOptions.enableSelect;
      const payload: Record<string, unknown> = {
        field: key,
        type: backendValue,
        ...(editingField ? { label: key } : {}),
        meta: {
          interface: "select-dropdown-m2o",
          width: "full" as const,
          readonly: isReadonly || undefined,
          hidden: isHidden || undefined,
          required: isRequired || undefined,
          searchable: isSearchable || undefined,
          note: fieldNote || undefined,
          ...(Object.keys(options).length > 0 ? { options } : {}),
        },
        schema: {
          name: key,
          table: collectionName,
          dataType: backendType?.dbType || backendValue,
          defaultValue: defaultValue || undefined,
          maxLength:
            backendValue === "STRING"
              ? (parseInt(fieldLength, 10) || undefined)
              : undefined,
          isNullable,
          isUnique,
          isIndexed,
        },
      };
      if (relation) payload.relation = relation;
      if (correspondingField.enabled && correspondingField.fieldKey) {
        payload.correspondingField = correspondingField;
      }
      return payload;
    }

    if (selectedInterface === "m2m") {
      const ifaceLayout = o2mOptions.layout === "table" ? "table-m2m" : "list-m2m";
      if (o2mOptions.enableCreate !== undefined) options.enableCreate = o2mOptions.enableCreate;
      if (o2mOptions.enableSelect !== undefined) options.enableSelect = o2mOptions.enableSelect;
      if (o2mOptions.displayTemplate) options.displayTemplate = o2mOptions.displayTemplate;
      const payload: Record<string, unknown> = {
        field: key,
        type: backendValue,
        ...(editingField ? { label: key } : {}),
        meta: {
          interface: ifaceLayout,
          width: "full" as const,
          readonly: isReadonly || undefined,
          hidden: isHidden || undefined,
          required: isRequired || undefined,
          searchable: isSearchable || undefined,
          note: fieldNote || undefined,
          ...(Object.keys(options).length > 0 ? { options } : {}),
        },
        schema: {
          name: key,
          table: collectionName,
          dataType: backendType?.dbType || backendValue,
          defaultValue: defaultValue || undefined,
          maxLength:
            backendValue === "STRING"
              ? (parseInt(fieldLength, 10) || undefined)
              : undefined,
          isNullable,
          isUnique,
          isIndexed,
        },
      };
      if (relation) payload.relation = relation;
      if (correspondingField.enabled && correspondingField.fieldKey) {
        payload.correspondingField = correspondingField;
      }
      return payload;
    }

    // Standard fields
    const payload: Record<string, unknown> = {
      field: key,
      type: backendValue,
      ...(editingField ? { label: key } : {}),
      meta: {
        interface: iface,
        width: "full" as const,
        readonly: isReadonly || undefined,
        hidden: isHidden || undefined,
        required: isRequired || undefined,
        searchable: isSearchable || undefined,
        note: fieldNote || undefined,
        ...(Object.keys(options).length > 0 ? { options } : {}),
      },
      schema: {
        name: key,
        table: collectionName,
        dataType: backendType?.dbType || backendValue,
        defaultValue: defaultValue || undefined,
        maxLength:
          backendValue === "STRING"
            ? (parseInt(fieldLength, 10) || undefined)
            : undefined,
        isNullable,
        isUnique,
        isIndexed,
      },
    };

    if (relation) payload.relation = relation;
    return payload;
  };

  return {
  typeDisabled: selectedInterface === "m2o" || selectedInterface === "o2m",
    activeTab,
    onTabChange: setActiveTab,
    rawType,
    onTypeChange: handleTypeChange,
    isM2O,
    selectedInterface,
    onInterfaceChange: setSelectedInterface,
    choices,
    onChoicesChange: setChoices,
    colors,
    onColorsChange: setColors,
    o2mOptions,
    onO2mOptionsChange: setO2mOptions,
    relation,
    onRelationChange: setRelation,
    tabs,
    buildPayload,
    resetForm,
    isStandardPreset,
    editingField,
    setRawType,

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

    // Field (meta) state
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
    onCorrespondingFieldChange: setCorrespondingField,
  };
}
