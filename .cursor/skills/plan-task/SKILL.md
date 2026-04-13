---
name: plan-task
description: >-
  Plan the implementation for a Jira task. Analyzes complexity, explores the
  codebase, and produces a step-by-step implementation plan. For complex or
  difficult tasks uses a thorough multi-file exploration; for simple tasks
  keeps the plan lightweight. Use when the user says "plan task", "plan this",
  "how should I implement", or after picking a task from Jira.
---

# Plan Task

Create an implementation plan for the currently picked Jira issue.

## Prerequisites

You must already have the full Jira issue details (key, summary, description, acceptance criteria). If not, run the **pick-task** skill first.

## Steps

### 1. Assess complexity

Read the issue description and acceptance criteria. Classify:

| Complexity | Criteria | Model guidance |
|------------|----------|----------------|
| **Simple** | Single file change, clear scope, no architectural decisions | Proceed with default model |
| **Medium** | 2-5 files, some decisions needed, clear pattern to follow | Proceed with default model |
| **Complex** | 6+ files, architectural decisions, new patterns, cross-cutting concerns | Request the user to use a more capable model (Opus 4.6) for planning |

If the task is **Complex**, tell the user:
> "This task is complex. For the best plan I recommend using a more capable model. Would you like to continue with the current model or switch?"

### 2. Explore the codebase

Use the **Task** tool with `subagent_type="explore"` to investigate relevant areas:

- Search for files and patterns related to the task
- Identify which files need to be created or modified
- Find existing patterns to follow (e.g., `use*Screen.ts`, `styles.ts`, `components/`)
- Check `src/lib/database/` for relevant data layer functions
- Check `src/stores/` for relevant state
- Check `src/navigation/` if routing changes are needed

For complex tasks, launch multiple explore agents in parallel for different areas.

### 3. Identify affected files

List every file that will be created or modified, grouped by:
- **New files** (with proposed path following project conventions)
- **Modified files** (with a 1-line summary of what changes)

### 4. Write the plan

Produce a structured plan:

```markdown
## Implementation Plan: KEY — Summary

### Complexity: Simple | Medium | Complex

### Overview
1-2 sentence summary of the approach.

### Files to change
1. `path/to/file.ts` — what and why
2. `path/to/new-file.ts` (new) — what and why

### Step-by-step
1. **Step title** — Detail of what to do, referencing specific functions/patterns.
2. **Step title** — ...

### Testing
- How to verify (typecheck, manual test steps)

### Risks / open questions
- Any unknowns or decisions the user should weigh in on
```

### 5. Get user approval

Present the plan and ask:
> "Does this plan look good? Should I proceed to implementation?"

### 6. Add plan as Jira comment (optional)

If the user approves, call `addCommentToJiraIssue` with a markdown summary of the plan:

```json
{
  "cloudId": "<cloudId>",
  "issueIdOrKey": "<KEY>",
  "commentBody": "## Implementation Plan\n\n...",
  "contentFormat": "markdown"
}
```
