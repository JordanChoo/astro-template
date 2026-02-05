<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Instructions

This project uses **bd** (beads) for issue tracking and **OpenSpec** for planning. Run `bd onboard` if you haven't already this session.

## When to Use Beads vs OpenSpec

| Situation                         | Tool  | Action                                                             |
| --------------------------------- | ----- | ------------------------------------------------------------------ |
| New feature/capability            | Both  | `bd create`, then `/opsx:ff` to plan                               |
| Planning complete, ready to build | Both  | Convert tasks to Beads issues, implement                           |
| Bug fix, small task, tech debt    | Beads | `bd create` directly                                               |
| Discovered issue during work      | Beads | `bd create "Found: <issue>" -t bug --discovered-from <current-id>` |
| Tracking what's ready             | Beads | `bd ready`                                                         |
| Work complete                     | Beads | Clean up artifacts, `bd close <id> --reason "Completed"`           |

## Workflow

Beads is the single system of record for all work, regardless of task size. OpenSpec is a planning tool — use it when a change needs structured thinking, skip it for trivial fixes.

### 1. Orient

```bash
bd ready --json                       # See unblocked work
```

Select highest priority ready issue OR continue in-progress work.

### 2. Pick Work

```bash
bd update <id> --status in_progress   # Claim it
```

### 3. Plan (if needed)

For non-trivial changes, use OpenSpec to produce planning artifacts:

```
/opsx:explore          # Think through the problem (optional)
/opsx:ff <name>        # Generate all planning artifacts at once
```

This creates `openspec/changes/<name>/` with proposal, specs, design, and tasks. These are reference documents — implement directly from them, not via `/opsx:apply`.

For trivial fixes, skip this step entirely.

### 4. Convert Tasks to Beads Issues

When planning artifacts are ready, create Beads issues from `tasks.md`:

```bash
# Create epic for the change
bd create "<change-name>" -t epic -p 1 -l "openspec:<change-name>"

# For each task in tasks.md, create a child issue with full context
bd create "<task description>" -t task -l "openspec:<change-name>" -d "..."
```

**Issues must be self-contained.** The test: could someone implement this issue correctly with ONLY the bd description and access to the codebase? If not, add more context.

**BAD — never do this:**

```bash
bd create "Update stripe-price.entity.ts" -t task
```

**GOOD — always do this:**

```bash
bd create "Add description and features fields to stripe-price.entity.ts" -t task -p 2 \
  -l "openspec:billing-improvements" \
  -d "## Spec Reference
openspec/changes/billing-improvements/specs/billing/spec.md

## Requirements
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

### 5. Implement

Write code directly, referencing OpenSpec artifacts if they exist. No `/opsx:apply` — just build it. File any discovered issues during work:

```bash
bd create "Found: <issue>" -t bug --discovered-from <current-id>
```

### 6. Close

```bash
rm -rf openspec/changes/<name>        # Clean up planning artifacts (git history preserves them)
bd close <id> --reason "Completed"    # Close the issue
```

## Git Branch Strategy

This project uses **feature branches** for significant changes (epics, multi-file features, architectural changes). Small fixes go directly to `main`. Planning happens on `main` for visibility; implementation of larger work happens on feature branches.

### When to Use Feature Branches

**ALWAYS use a feature branch for:**

- Epics and multi-task initiatives
- New features spanning multiple files
- Architectural changes or refactors
- Any work with OpenSpec planning artifacts
- Changes that benefit from PR review

**Rule of thumb:** If it has an epic or OpenSpec change, it needs a feature branch.

### Branch Naming Convention

| Type    | Pattern          | Example                       |
| ------- | ---------------- | ----------------------------- |
| Feature | `feature/<name>` | `feature/astro-starter-theme` |
| Bug fix | `fix/<name>`     | `fix/mobile-nav-focus-trap`   |
| Chore   | `chore/<name>`   | `chore/update-dependencies`   |

### OpenSpec + Feature Branches

Planning artifacts are created on `main` so the team has visibility before implementation starts. Artifacts are deleted after the feature branch is merged.

```
main:     [plan] ─────────────────────────────── [merge] → [delete artifacts]
                  \                             /
feature:           └── [implement] ── [PR] ────┘
```

**Why plan on `main`?**

- Planning is visible to everyone before work starts
- Artifacts serve as documentation during review
- Git history preserves artifacts after deletion

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
# PHASE 1: Plan on main (shared visibility)
# ═══════════════════════════════════════════════════════════════════
git checkout main
git pull

# Create planning artifacts
/opsx:ff <change-name>

# Create tracking issue
bd create "<change-name>" -t epic -p 1 -l "openspec:<change-name>" -d "## Requirements
- <what this change accomplishes>

## Reference
- openspec/changes/<change-name>/tasks.md
- openspec/changes/<change-name>/design.md

## Acceptance Criteria
- <how to verify completion>"

# Push planning to main
bd sync
git add -A
git commit -m "plan: <change-name>"
git push

# ═══════════════════════════════════════════════════════════════════
# PHASE 2: Implement on feature branch
# ═══════════════════════════════════════════════════════════════════
git checkout -b feature/<change-name>

# Claim the work
bd update <id> --status in_progress

# ... implement, referencing openspec/changes/<change-name>/ ...

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

# Delete planning artifacts (git history preserves them)
rm -rf openspec/changes/<change-name>

# Final sync and push
bd sync
git add -A
git commit -m "chore: cleanup planning artifacts"
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

- `openspec:<change-name>` - Links issue to OpenSpec change
- `spec:<spec-name>` - Links to specific spec file
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

#### 3. Clean Up OpenSpec Artifacts

Remove any completed change directories from `openspec/changes/`.

#### 4. Update All Tracking

```bash
bd close <id> --reason "Completed"                     # Finished work
bd update <id> --status in_progress                    # Partially done
bd update <id> --add-note "Session end: <context>"     # Add context for next session
```

#### 5. Sync and Push (MANDATORY)

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

#### 6. Clean Up

- Clear stashes: `git stash clear` (if appropriate)
- Delete merged feature branches:
  ```bash
  git branch -d feature/<name>                    # Local
  git push origin --delete feature/<name>         # Remote (if merged)
  ```
- Prune stale remote tracking branches: `git fetch --prune`

#### 7. Verify Final State

```bash
bd list --status open    # Review open issues
bd ready                 # Show what's ready for next session
git status               # Must be clean and pushed
```

#### 8. Hand Off

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
