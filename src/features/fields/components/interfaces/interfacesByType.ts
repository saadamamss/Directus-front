import {
  Type,
  ChevronDown,
  CircleDot,
  Palette,
  AlignLeft,
  FileText,
  ToggleLeft,
  SlidersHorizontal,
  ImageIcon,
  ArrowRight,
  List,
  GitBranch,
  FolderOpen,
} from "lucide-react";
import type { ElementType } from "react";

export type InterfaceOption = {
  value: string;
  title: string;
  subtitle: string;
  icon: ElementType;
};

export const interfacesByType: Record<string, InterfaceOption[]> = {
  STRING: [
    { value: "input", title: "Input", subtitle: "Standard text input", icon: Type },
    { value: "dropdown", title: "Dropdown", subtitle: "Select from predefined options", icon: ChevronDown },
    { value: "radio-buttons", title: "Radio Buttons", subtitle: "Select a single option", icon: CircleDot },
    { value: "color", title: "Color", subtitle: "Color picker interface", icon: Palette },
  ],
  TEXT: [
    { value: "textarea", title: "Textarea", subtitle: "Multi-line text input", icon: AlignLeft },
    { value: "wysiwyg", title: "WYSIWYG", subtitle: "Rich text editor", icon: FileText },
    { value: "input", title: "Input", subtitle: "Standard text input", icon: Type },
  ],
  BOOLEAN: [
    { value: "toggle", title: "Toggle", subtitle: "Switch between on and off", icon: ToggleLeft },
  ],
  NUMBER: [
    { value: "input", title: "Input", subtitle: "Standard number input", icon: Type },
    { value: "dropdown", title: "Dropdown", subtitle: "Select from predefined options", icon: ChevronDown },
    { value: "radio-buttons", title: "Radio Buttons", subtitle: "Select a single option", icon: CircleDot },
    { value: "slider", title: "Slider", subtitle: "Select a value from a range", icon: SlidersHorizontal },
    { value: "m2o", title: "Many to One", subtitle: "Belongs to one", icon: ArrowRight },
  ],
  BIGINT: [
    { value: "input", title: "Input", subtitle: "Standard number input", icon: Type },
    { value: "dropdown", title: "Dropdown", subtitle: "Select from predefined options", icon: ChevronDown },
    { value: "radio-buttons", title: "Radio Buttons", subtitle: "Select a single option", icon: CircleDot },
    { value: "m2o", title: "Many to One", subtitle: "Belongs to one", icon: ArrowRight },
  ],
  FLOAT: [
    { value: "input", title: "Input", subtitle: "Standard number input", icon: Type },
    { value: "dropdown", title: "Dropdown", subtitle: "Select from predefined options", icon: ChevronDown },
    { value: "radio-buttons", title: "Radio Buttons", subtitle: "Select a single option", icon: CircleDot },
    { value: "slider", title: "Slider", subtitle: "Select a value from a range", icon: SlidersHorizontal },
  ],
  DECIMAL: [
    { value: "input", title: "Input", subtitle: "Standard number input", icon: Type },
    { value: "dropdown", title: "Dropdown", subtitle: "Select from predefined options", icon: ChevronDown },
  ],
  DATE: [
    { value: "date", title: "Date", subtitle: "Date picker", icon: ChevronDown },
  ],
  UUID: [
    { value: "input", title: "Input", subtitle: "Standard text input", icon: Type },
    { value: "image", title: "Image", subtitle: "Single file upload", icon: ImageIcon },
    { value: "m2o", title: "Many to One", subtitle: "Belongs to one", icon: ArrowRight },
  ],
  ALIAS: [
    { value: "o2m", title: "One to Many", subtitle: "Has many related items", icon: List },
    { value: "m2m", title: "Many to Many", subtitle: "Connects to many", icon: GitBranch },
    { value: "files", title: "Files", subtitle: "Multiple file upload", icon: FolderOpen },
  ],
};
