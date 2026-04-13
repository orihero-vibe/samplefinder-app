---
name: implement-task
description: >-
  Implement a planned Jira task. Follows the approved implementation plan,
  creates/modifies files, runs typecheck, and validates the work. Always uses
  the default model but delegates complex sub-tasks to more capable models
  when needed. Use when the user says "implement", "build it", "code it",
  "start implementing", or after planning a task.
---

# Implement Task

Execute the approved implementation plan for the current Jira issue.

## Prerequisites

- A Jira issue key and description
- An approved implementation plan (from **plan-task** skill)

## Steps

### 1. Create a feature branch

```bash
git checkout -b feat/<ISSUE-KEY>-<short-slug>
```

Use lowercase, kebab-case. Example: `feat/SAM-42-brand-filter-screen`.

### 2. Follow the plan step by step

For each step in the plan:

1. **Read** the target file(s) before editing
2. **Edit** following existing patterns in the codebase
3. **Validate** after each meaningful change:
   - Run `npm run typecheck` after TypeScript edits
   - Check `ReadLints` on modified files
   - Fix any introduced errors before moving on

### 3. Delegation rules

- **Default**: Do all work directly using available tools
- **Complex sub-tasks**: If a single step involves deep reasoning across 6+ files, architectural decisions, or intricate type gymnastics, use the **Task** tool with a capable model and a detailed prompt including all relevant context
- **Parallel work**: If the plan has independent steps, launch multiple Task agents in parallel (e.g., creating a new screen component while also adding a database function)

### 4. Follow project conventions

Refer to the project rules (always loaded):

- Path alias: `@/` maps to `src/`
- Screens: `use*Screen.ts` for logic, `styles.ts` for styles, `components/` for sub-components
- Database: functions in `src/lib/database/`, re-export from `index.ts`
- State: Zustand stores in `src/stores/`
- Never add server-side Appwrite keys to the client

### 5. Final validation

After all steps complete:

1. Run `npm run typecheck` — must pass with zero errors
2. Run `ReadLints` on all modified files
3. Review the diff: `git diff --stat` to confirm scope matches the plan
4. If any step failed or deviated from the plan, explain why

### 6. Summary

Output:

```markdown
## Implementation Complete: KEY — Summary

### Changes made
- `path/to/file.ts` — description of change
- ...

### Typecheck: PASS / FAIL (with details)

### Ready for PR: Yes / No (with blockers if No)
```

### Error handling

- If typecheck fails, fix the errors (up to 3 attempts) before reporting
- If a lint error is pre-existing (not introduced by you), note it but don't block
- If stuck on a step, report the blocker to the user with context rather than guessing
