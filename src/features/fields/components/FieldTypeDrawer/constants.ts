export const textAndNumberFields = ["Input", "Textarea", "WYSIWYG"];
export const selectionFields = ["Toggle", "Date", "Image"];

export const simpleTypeToValue: Record<string, string> = {
  Input: "STRING",
  Textarea: "TEXT",
  WYSIWYG: "TEXT",
  Toggle: "BOOLEAN",
  Date: "DATE",
  Image: "UUID",
};

export const simpleTypeToInterface: Record<string, string | null> = {
  Input: "input",
  Textarea: "textarea",
  WYSIWYG: "wysiwyg",
  Toggle: "toggle",
  Date: null,
  Image: null,
};
