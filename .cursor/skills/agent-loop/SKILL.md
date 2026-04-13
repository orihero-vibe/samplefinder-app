---
name: agent-loop
description: >-
  Full agentic workflow loop: pick a Jira task, plan implementation, implement
  the code, and create a PR. Orchestrates the pick-task, plan-task,
  implement-task, and create-pr skills end-to-end. Use when the user says
  "agent loop", "full loop", "pick and implement", "work on next task",
  "autonomous mode", or "run the loop".
---

# Agent Loop

End-to-end workflow: Jira task to merged-ready PR in one conversation.

## Overview

This skill chains four sub-skills in order:

```
pick-task → plan-task → implement-task → create-pr
```

Each phase has a user checkpoint before proceeding.

## Jira status flow (SAM)

Issues are picked from **Blocked**, **Reopen**, or **Ready for Dev** → moved to **In Development** when work starts (pick-task) → moved to **Committed** when the PR is opened (create-pr). Board: `https://buildbolder.atlassian.net/jira/software/projects/SAM/boards/424`.

## Workflow

### Phase 1: Pick Task

Read and follow `.cursor/skills/pick-task/SKILL.md` (includes loading and summarizing Jira **comments** before moving the issue to In Development).

**Checkpoint**: User confirms the selected task.

---

### Phase 2: Plan Task

Read and follow `.cursor/skills/plan-task/SKILL.md`.

Decision on model:
- **Simple/Medium tasks** — plan with the current (auto) model
- **Complex/Difficult tasks** — recommend the user switch to a more capable model (Opus 4.6) for the planning phase, then switch back to auto for implementation

**Checkpoint**: User approves the plan.

---

### Phase 3: Implement

Read and follow `.cursor/skills/implement-task/SKILL.md`.

Always use the current (auto) model. If a particular sub-step is extremely complex (e.g., deep architectural refactor touching 6+ files), delegate that sub-step to a Task subagent. Otherwise execute directly.

**Checkpoint**: Implementation summary shown; user confirms ready for PR.

---

### Phase 4: Create PR

Read and follow `.cursor/skills/create-pr/SKILL.md`.

**Checkpoint**: PR URL shown to user. Jira updated.

---

## Loop continuation

After the PR is created, ask:

> "Task KEY is done. Want to pick the next task and continue the loop?"

If yes, go back to Phase 1.

## Error recovery

- If any phase fails, report the error clearly and ask the user how to proceed
- Never skip a checkpoint — always get user confirmation before the next phase
- If typecheck fails after 3 fix attempts, stop and report the issue
- Keep the Jira issue updated with comments reflecting the current state

## State tracking

Use the **TodoWrite** tool to track progress through the loop:

```
1. [x] Pick task: SAM-42 — Brand filter screen
2. [x] Plan: approved (6 files, medium complexity)
3. [ ] Implement: step 3/5
4. [ ] Create PR
```

Update todos as each phase completes.
