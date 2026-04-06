# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` if you haven't already this session.

## Workflow

Beads is the single system of record for all work, regardless of task size.

### 1. Orient

```bash
bd ready --json                       # See unblocked work
```

Select highest priority ready issue OR continue in-progress work.

### 2. Pick Work

```bash
bd update <id> --status in_progress   # Claim it
```

### 3. Create Issues

**Issues must be self-contained.** The test: could someone implement this issue correctly with ONLY the bd description and access to the codebase? If not, add more context.

**BAD — never do this:**

```bash
bd create "Update stripe-price.entity.ts" -t task
```

**GOOD — always do this:**

```bash
bd create "Add description and features fields to stripe-price.entity.ts" -t task -p 2 \
  -d "## Requirements
- Add 'description: string' field (nullable)
- Add 'features: string[]' field for feature list display
- Sync fields from Stripe Price metadata on webhook

## Acceptance Criteria
- Fields populated from Stripe dashboard metadata
- Features displayed as bullet list on pricing page

## Files to Modify
- apps/api/src/billing/entities/stripe-price.entity.ts
- apps/api/src/billing/stripe-webhook.service.ts"
```

### 4. Implement

Write code directly. File any discovered issues during work:

```bash
bd create "Found: <issue>" -t bug --discovered-from <current-id>
```

### 5. Close

```bash
bd close <id> --reason "Completed"    # Close the issue
```

## Git Branch Strategy

This project uses **feature branches** for significant changes (epics, multi-file features, architectural changes). Small fixes go directly to `main`. Planning happens on `main` for visibility; implementation of larger work happens on feature branches.

### When to Use Feature Branches

**ALWAYS use a feature branch for:**

- Epics and multi-task initiatives
- New features spanning multiple files
- Architectural changes or refactors
- Changes that benefit from PR review

**Rule of thumb:** If it has an epic or spans multiple files, it needs a feature branch.

### Branch Naming Convention

| Type    | Pattern          | Example                       |
| ------- | ---------------- | ----------------------------- |
| Feature | `feature/<name>` | `feature/astro-starter-theme` |
| Bug fix | `fix/<name>`     | `fix/mobile-nav-focus-trap`   |
| Chore   | `chore/<name>`   | `chore/update-dependencies`   |

### Beads + Feature Branches

Beads stores issues in `.beads/issues.jsonl` with a custom merge driver (see `.gitattributes`) designed to handle concurrent modifications across branches.

**Key points:**

- Create shared issues (epics, tasks) on `main` before branching
- Update issue status on your feature branch as you work
- `bd sync` commits to the current branch (no `sync-branch` configured)
- The merge driver handles conflicts when branches merge

### Complete Feature Branch Workflow

```bash
# ═══════════════════════════════════════════════════════════════════
# PHASE 1: Set up on main
# ═══════════════════════════════════════════════════════════════════
git checkout main
git pull

# Create tracking issue
bd create "<change-name>" -t epic -p 1 -d "## Requirements
- <what this change accomplishes>

## Acceptance Criteria
- <how to verify completion>"

bd sync
git add -A
git commit -m "chore: create epic for <change-name>"
git push

# ═══════════════════════════════════════════════════════════════════
# PHASE 2: Implement on feature branch
# ═══════════════════════════════════════════════════════════════════
git checkout -b feature/<change-name>

# Claim the work
bd update <id> --status in_progress

# ... implement ...

# Commit progress (run bd sync before each commit)
bd sync
git add <files>
git commit -m "feat: <description>"

# Push feature branch
git push -u origin feature/<change-name>

# ═══════════════════════════════════════════════════════════════════
# PHASE 3: Prepare for PR
# ═══════════════════════════════════════════════════════════════════
# Close completed issues
bd close <id> --reason "Completed"

# Final sync and push
bd sync
git add -A
git commit -m "chore: finalize <change-name>"
git push

# Create PR
gh pr create --title "feat: <change-name>" --body "## Summary
- <what this PR accomplishes>

## Test Plan
- <how to verify>

Closes #<issue-number>"

# ═══════════════════════════════════════════════════════════════════
# PHASE 4: After merge
# ═══════════════════════════════════════════════════════════════════
git checkout main
git pull
git branch -d feature/<change-name>              # Delete local branch
git push origin --delete feature/<change-name>   # Delete remote branch (optional)
```

### Handling Long-Lived Branches

For branches that last multiple days:

```bash
# Rebase regularly to stay current with main
git fetch origin
git rebase origin/main

# If Beads conflicts occur, the merge driver handles most cases
# For manual resolution, prefer the version with more recent timestamps
```

### When to Commit Directly to Main

Use direct commits to `main` **only** for small, isolated changes:

- Typo fixes and minor copy changes
- Documentation updates (README, comments)
- Single-file config changes
- Individual bug fixes (single task, not part of epic)
- Emergency hotfixes (with immediate follow-up)

**Rule of thumb:** If it's a single task that can be done in one commit, it can go to `main`. If it's an epic or requires multiple coordinated commits, use a feature branch.

## Label Conventions

- `discovered` - Issue found during other work
- `tech-debt` - Technical debt items
- `blocked-external` - Blocked by external dependency

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd create <title>     # File new issue (MUST include -d, see CLAUDE.md)
bd update <id> --status in_progress  # Claim work
bd close <id> --reason "Completed"   # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

#### 1. File Issues for Remaining Work

Create Beads issues for anything that needs follow-up:

```bash
bd create "TODO: <description>" -t task -p 2 -d "## Requirements
- <what needs doing>

## Context
- <relevant details>"
bd create "Bug: <description>" -t bug -p 1 -d "## Requirements
- <what's broken>

## Context
- <how it was discovered>"
```

#### 2. Run Quality Gates (if code changed)

- Tests, linters, builds
- File P0 issues if builds are broken

#### 3. Update All Tracking

```bash
bd close <id> --reason "Completed"                     # Finished work
bd update <id> --status in_progress                    # Partially done
bd update <id> --add-note "Session end: <context>"     # Add context for next session
```

#### 4. Sync and Push (MANDATORY)

ALWAYS run `bd sync` before committing to capture issue changes.

**On feature branch:**

```bash
bd sync
git add -A
git commit -m "wip: session end - <summary>"
git push
git status  # MUST show "up to date with origin"
```

**On main (or after merging):**

```bash
bd sync
git pull --rebase
git add -A
git commit -m "chore: session end - <summary>"
git push
git status  # MUST show "up to date with origin"
```

#### 5. Clean Up

- Clear stashes: `git stash clear` (if appropriate)
- Delete merged feature branches:
  ```bash
  git branch -d feature/<name>                    # Local
  git push origin --delete feature/<name>         # Remote (if merged)
  ```
- Prune stale remote tracking branches: `git fetch --prune`

#### 6. Verify Final State

```bash
bd list --status open    # Review open issues
bd ready                 # Show what's ready for next session
git status               # Must be clean and pushed
```

#### 7. Hand Off

Provide context for next session:

```
## Next Session Context
- Current epic: <id and name>
- Ready work: `bd ready` shows N issues
- Blocked items: <any blockers>
- Notes: <important context>
```

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
- ALWAYS run `bd sync` before committing to capture issue changes
