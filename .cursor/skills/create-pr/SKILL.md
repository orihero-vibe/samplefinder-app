---
name: create-pr
description: >-
  Create a pull request for the implemented Jira task. Commits changes, pushes
  the branch, creates a GitHub PR with structured summary linked to the Jira
  issue, and transitions the Jira issue to Committed. Use when the user says
  "create PR", "open PR", "submit PR", "make pull request", or after
  implementing a task.
---

# Create PR

Commit, push, and open a GitHub pull request for the current feature branch, then update Jira.

**Jira:** project **SAM**, site `buildbolder.atlassian.net`. After the PR exists, move the issue to **Committed**.

## Prerequisites

- Implementation is complete on a feature branch
- Typecheck passes
- A Jira issue key is known (e.g. `SAM-123`)

## Steps

### 1. Review changes

Run in parallel:
- `git status` — check for untracked files
- `git diff` — review all changes
- `git log --oneline -5` — check recent commit style

### 2. Stage and commit

Stage all relevant files (exclude `.env`, credentials, generated binaries):

```bash
git add -A
```

Commit with a message following the repo's style. Use the Jira key as prefix:

```
<type>(<scope>): <summary> [KEY]

<optional body explaining why>
```

**Types**: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`

Example:
```
feat(brands): add brand filter screen [SAM-42]

Implements filterable brand list with search, connected to
Appwrite brands collection.
```

Use a HEREDOC for the commit message to preserve formatting.

### 3. Push the branch

```bash
git push -u origin HEAD
```

### 4. Create the pull request

Use `gh pr create` with a structured body:

```markdown
## Summary
<!-- 1-3 bullet points of what changed and why -->

## Jira
[SAM-123](https://buildbolder.atlassian.net/browse/SAM-123)

## Changes
<!-- List of files changed with brief descriptions -->

## Test plan
<!-- How to verify this works -->

## Screenshots
<!-- If applicable -->
```

Replace `SAM-123` with the actual key.

### 5. Transition Jira issue to **Committed**

After the PR is created, move the issue from **In Development** (or current status) to **Committed**.

1. Call `getTransitionsForJiraIssue` for the issue.
2. Select the transition whose **destination status** is **Committed**, or whose name clearly means "committed" / "code committed" for your workflow.
3. Call `transitionJiraIssue` with that transition `id`.
4. If no "Committed" transition appears, list available transitions for the user and do not guess— they may need to adjust the workflow or move the card manually.

### 6. Add PR link to Jira

Call `addCommentToJiraIssue`:

```json
{
  "cloudId": "<cloudId>",
  "issueIdOrKey": "<KEY>",
  "commentBody": "PR opened: <PR_URL>",
  "contentFormat": "markdown"
}
```

### 7. Output

```markdown
## PR Created: KEY — Summary

**Branch:** feat/KEY-slug
**PR:** <URL>
**Jira status:** Committed
```
