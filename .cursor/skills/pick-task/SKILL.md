---
name: pick-task
description: >-
  Pick a Jira task to work on. Fetches issues from the SampleFinder (SAM) Jira
  board in pickable statuses, lets the user choose one, loads issue comments
  together with description, and transitions the issue to In Development. Use
  when the user says "pick task", "next task", "what should I work on", or
  "start task".
---

# Pick Task

Fetch the next task from Jira for implementation.

**Board:** [SAM board](https://buildbolder.atlassian.net/jira/software/projects/SAM/boards/424) (project `SAM`, site `buildbolder.atlassian.net`).

## Steps

### 1. Discover Atlassian cloud ID

Call `getAccessibleAtlassianResources` (MCP server: `plugin-atlassian-atlassian`) with no arguments. Cache the `cloudId` for every subsequent Jira call. You can pass `buildbolder.atlassian.net` as `cloudId` if the docs say hostname works.

### 2. Identify the current user

Call `atlassianUserInfo` to get the current user's account ID and display name.

### 3. Fetch candidate issues

Call `searchJiraIssuesUsingJql` with JQL scoped to **SAM** and pickable statuses: **Blocked**, **Reopen**, **Ready for Dev**.

```json
{
  "cloudId": "<cloudId>",
  "jql": "project = SAM AND assignee = currentUser() AND status in (\"Blocked\", \"Reopen\", \"Ready for Dev\") ORDER BY priority DESC, created ASC",
  "maxResults": 15,
  "fields": ["summary", "description", "status", "issuetype", "priority", "labels", "story_points", "comment"],
  "responseContentFormat": "markdown"
}
```

- If **no results**, try widening: drop `assignee = currentUser()` and show unassigned SAM issues in those statuses, or adjust status names to match Jira exactly (e.g. `Reopened`, `Ready for Development`) if your workflow uses different labels—use `getJiraIssue` on a known issue to confirm status strings.
- Use `fields.comment` from search hits when present: include **comment count** in the AskQuestion labels (e.g. `SAM-1 — Summary (Ready for Dev · 4 comments)`) so the user sees activity at a glance.

### 4. Present choices to the user

Use the **AskQuestion** tool to show a numbered list. Each option: `KEY — Summary (Status · Priority · N comments)` when count is known; omit the comment fragment if zero or unknown.

### 5. Fetch full issue details **including comments**

Once the user picks an issue, call `getJiraIssue` with:

- `responseContentFormat`: `"markdown"`
- `fields`: include at least `summary`, `description`, `status`, `issuetype`, `priority`, `comment`, `subtasks`, `labels`, and any fields needed for acceptance criteria (e.g. custom fields your board uses).

**Comments are mandatory to review before transitioning.** From the response:

1. Parse `comment` / rendered comment bodies (author, created time, body).
2. Present comments in **chronological order** (oldest first) so the thread reads naturally; if there are **many** comments, show the **full text of the most recent 10** plus a one-line summary of older ones, and state **total comment count** (e.g. "12 comments total; showing 10 most recent in full").
3. If there are **no** comments, state that explicitly.
4. Surface anything that looks like **blockers**, **scope changes**, or **links to PRs/specs** from comments in a short bullet list so planning does not miss them.

Do **not** transition the issue until this description + comments summary has been shown to the user (they may skim before work starts).

### 6. Transition to **In Development**

When work starts, the issue must move to **In Development** (not "In Progress").

1. Call `getTransitionsForJiraIssue` for the chosen issue.
2. From the returned transitions, pick the one whose **destination status** is **In Development**, or whose transition **name** clearly starts development (e.g. contains "Development" in a way that maps to that column—avoid unrelated transitions).
3. Call `transitionJiraIssue` with that transition `id`.
4. If no matching transition exists, list available transition names to the user and ask which to use, or ask them to move the issue manually in Jira.

### 7. Output

Return a structured summary to the user:

```
## Picked: KEY — Summary

**Type:** Bug / Story / Task
**Priority:** High / Medium / Low
**Status:** In Development (after transition)
**Description:** (full markdown description)
**Acceptance criteria:** (if present)

### Comments (N total)
<!-- For each comment: author · date — excerpt or full body in markdown -->
1. …
2. …

### Notes from comments
- <!-- blockers, scope changes, PR links, decisions -->
```

If comments are paginated or truncated in the API response, add: `Full thread: https://buildbolder.atlassian.net/browse/KEY`

Store the issue key mentally — it will be used by the **plan-task** and **create-pr** skills next.
