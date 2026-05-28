export type MenuSection = "content" | "settings" | "files" | "login" | "profile";

const sectionPatterns: Record<MenuSection, string[]> = {
  content: ["/admin/content"],
  settings: ["/admin/settings"],
  files: ["/admin/files"],
  login: ["/admin/login"],
  profile: ["/admin/profile"],
};

export function getMenuSection(pathname: string): MenuSection {
  for (const [section, patterns] of Object.entries(sectionPatterns)) {
    if (patterns.some((p) => pathname.startsWith(p))) {
      return section as MenuSection;
    }
  }
  return "content";
}
