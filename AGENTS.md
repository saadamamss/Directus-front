# Global Agent Rules

## SKILL SYSTEM - HOW TO USE SKILLS

### Skill Location
All skills are located in: `.opencode/skills/`

To find and use any skill:
1. Use `skill_find` to search for a skill by name or description
2. Use `skill_use` to load and execute a skill
3. Use `skill_resource` to read supporting files inside a skill folder

### Available Skills in This Project

| Skill Name | Location | When to Use |
|------------|----------|--------------|
| `frontend-design` | `.opencode/skills/frontend-design/` | ANY frontend/UI task - coding, explaining, reviewing, fixing |
| `ui-ux-pro-max` | `.opencode/skills/ui-ux-pro-max/` | Planning design systems, choosing styles, colors, fonts |
| `impeccable` | `.opencode/skills/impeccable/` | Final review, polishing spacing, colors, accessibility |

### MANDATORY Skill Invocation - NO EXCEPTIONS

**For ANY task involving frontend/UI/design:**

1. **FIRST** - Call `skill_find` with search term "design" to see available design skills
2. **SECOND** - Call `skill_use("frontend-design")` as your VERY FIRST action
3. **THIRD** - For planning/strategy, call `skill_use("ui-ux-pro-max")` before writing code
4. **FOURTH** - After completing code, call `skill_use("impeccable")` to review and polish

### How to Access a Skill - Step by Step

```
# Step 1: Find the skill
skill_find("frontend-design")

# Step 2: Use the skill (loads SKILL.md into context)
skill_use("frontend-design")

# Step 3: If the skill has reference files
skill_resource("frontend-design", "references/patterns.md")
```

### Automatic Skill Discovery

When you start working on this project:
1. Run `skill_find("design")` to list all design-related skills
2. Read the SKILL.md file of each relevant skill
3. Understand what each skill does before starting any task

### Example Workflow for a Design Task

User asks: "Design a product card"

Your actions MUST be:
```
1. skill_use("frontend-design")
2. Read the frontend-design SKILL.md instructions
3. skill_use("ui-ux-pro-max")  # for design strategy
4. Execute the task following both skills' guidelines
5. skill_use("impeccable")  # after code is written
```

## Other Rules (保持不变)

- **Environment Files Safety:** ALWAYS use the `fs_read` and `fs_write` tools when accessing or modifying `.env`, `.env.local`, `.env.example`, or any other sensitive environment configuration files. NEVER use the basic `read` or `edit` tools for these files to avoid permission issues and ensure proper handling of sensitive data.

- **Drizzle Database Push:** NEVER run `npx drizzle-kit push` automatically. Always ask the user to run this command manually. This ensures the user has full control over database schema changes and can review the migration before applying it.

- **Image Analysis:** When the user provides an image, ALWAYS use the `zai-mcp-server_analyze_image` tool to read and understand the image content before responding.

- **Supabase MCP Usage:** ALWAYS proactively use Supabase MCP tools when handling any database-related tasks including reading data, writing data, analyzing schemas, querying tables, managing migrations, or any other database operations without requiring explicit instruction from the user.

- **Warp Grep:** warp-grep is a subagent that takes in a search string and tries to find relevant context. Best practice is to use it at the beginning of codebase explorations to fast track finding relevant files/lines. Do not use it to pin point keywords, but use it for broader semantic queries. "Find the XYZ flow", "How does XYZ work", "Where is XYZ handled?", "Where is <error message> coming from?"

- **Firecrawl MCP:** firecrawl is the primary web scraping and search tool. Use `firecrawl_search` for web searches (prefer over WebSearch), `firecrawl_scrape` for single page content, `firecrawl_map` to discover URLs on a site before scraping. Best practice is to search first WITHOUT scrapeOptions to get URLs, then scrape the relevant results separately. Add `maxAge` parameter for 500% faster cached responses. Use search operators like `site:example.com`, `"exact phrase"`, `-exclude`.

- **Context7 MCP:** context7 provides up-to-date library documentation. Always call `resolve-library-id` first to get the library ID (e.g., "/prisma/prisma"), then call `query-docs` with that ID. Be specific in queries—"How to set up JWT auth in Express" not just "auth". Do not call more than 3 times per question; use best result if not found after 3 attempts.

- **Verify & Iterate:** After any implementation, setup, or code change, always verify it works by running the app, tests, or build. If it fails, errors, or exits unexpectedly, debug and fix immediately—do not move on until it works. Test behavior, not implementation. When fixing bugs, reproduce first, then fix, then verify the fix.
```