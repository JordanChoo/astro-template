# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Style & Approach

**CRITICAL: Think First, Code Once - Not the Other Way Around**

When tackling any non-trivial task, especially those involving complex systems (UI interactions, state management, API integrations, etc.):

### Required Process

1. **ANALYZE THOROUGHLY FIRST** - Read and understand ALL relevant code before making any changes
2. **MAP THE SYSTEM** - Identify all dependencies, interactions, and potential side effects
3. **CLARIFY REQUIREMENTS** - If ANYTHING is unclear, ambiguous, or could be interpreted multiple ways, **STOP and ASK QUESTIONS**. Never assume or guess at requirements.
4. **DESIGN A COMPLETE SOLUTION** - Think through the entire approach on "paper" first
5. **PRESENT THE PLAN** - Explain the strategy clearly before writing any code
6. **IMPLEMENT CAREFULLY** - Make changes systematically, following the agreed plan
7. **STICK TO THE PLAN** - Don't pivot to quick fixes that create new problems

### Usage of console.log in debugging

- It is IMPERATIVE that in order to understand what's happening in the system, you use `console.log` in critical points of the system to understand what's TRULY happening!
- If the user reports an error, you MUST UNDERSTAND what's going on not just through the analysis of the code, but through the analysis of the logs you write

### Absolutely Forbidden

- ❌ Making reactive changes without understanding root causes
- ❌ Fixing one bug and creating another (going in circles)
- ❌ Changing approach multiple times mid-task
- ❌ Quick fixes that break other things
- ❌ Jumping to implementation before thorough analysis

### If You Get Stuck

- **STOP** - Don't keep trying random fixes
- **STEP BACK** - Re-analyze the entire system
- **ADD CONSOLE LOGS** - Only by seeing the logs can you understand what's going on
- **ASK** - Request clarification or context from the user
- **REDESIGN** - Create a new plan based on better understanding

**Remember:** Breaking more things than you fix wastes time and causes frustration. Spending 10 minutes on proper analysis upfront is better than 60 minutes going in circles.

## Project Overview

This is an Astro business website template using:

- **Beads** (`bd` CLI) - AI-native issue tracking that lives in git (`.beads/`). Single system of record for all work, regardless of task size.

## Workflow

1. **Pick work** — `bd ready` → `bd update <id> --status in_progress`
2. **Implement** — Write code directly.
3. **Close** — `bd close <id>` → `bd sync && git push`

## Issue Tracking

ALWAYS use `bd` (Beads) for issue tracking.

### STRICT RULE: Every `bd create` MUST include `-d`

❌ **FORBIDDEN** — will be rejected:

```bash
bd create "Update file.ts" -t task
```

✅ **REQUIRED** — every issue needs full context:

```bash
bd create "Title" -t task -p 2 -l "label" -d "## Requirements
- What needs to be done

## Acceptance Criteria
- How to verify it's done

## Context
- Relevant file paths, spec references"
```

**No exceptions.** If you don't have enough context for `-d`, ask the user first.

## Architecture

### Beads Storage

- `.beads/issues.jsonl` - Git-tracked issue data (uses custom merge driver via `.gitattributes`)
- `.beads/beads.db` - Local SQLite database (git-ignored)
- `.beads/config.yaml` - Daemon and integration settings

## Session Completion Protocol

When ending a session, ALL of these steps are mandatory (see AGENTS.md):

1. File issues for remaining work
2. Run quality gates if code changed
3. Close finished Beads issues
4. **Push to remote** - work is NOT done until `git push` succeeds:
   ```bash
   git pull --rebase && bd sync && git push && git status
   ```
5. Clean up stashes/branches
6. Hand off context for next session
