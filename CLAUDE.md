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

This is a workflow infrastructure repository using two integrated systems:
- **Beads** (`bd` CLI) - AI-native issue tracking that lives in git (`.beads/`). Single system of record for all work, regardless of task size.
- **OpenSpec** - Planning tool for structured thinking (`openspec/`, `.claude/skills/`, `.claude/commands/opsx/`). Used only for planning — not for execution tracking.

There is no application code, build system, or package manager. The project consists of YAML configs, markdown documentation, and Claude skill definitions.

## Workflow

1. **Pick work** — `bd ready` → `bd update <id> --status in_progress`
2. **Plan (if needed)** — `/opsx:explore` or `/opsx:ff <name>` to generate planning artifacts
3. **Implement** — Write code directly, referencing artifacts. No `/opsx:apply`.
4. **Close** — `rm -rf openspec/changes/<name>` → `bd close <id>` → `bd sync && git push`

OpenSpec is a planning scratchpad. Artifacts are temporary — delete them after closing the Beads issue. Git history preserves them.

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

### OpenSpec Planning (used only for non-trivial changes)
```
/opsx:explore     # Thinking mode - investigate before planning
/opsx:ff          # Generate all planning artifacts at once
/opsx:new         # Step-by-step artifact creation (when you want more control)
```

### OpenSpec Commands NOT Used in This Project
`/opsx:apply`, `/opsx:verify`, `/opsx:archive`, `/opsx:sync`, `/opsx:continue` — Beads handles execution tracking and completion. OpenSpec artifacts are cleaned up directly.

## Architecture

### OpenSpec Planning Artifacts
When planning is needed, `/opsx:ff <name>` creates `openspec/changes/<name>/` with:
- `proposal.md` - Why, what capabilities, impact
- `specs/<capability>/spec.md` - Requirements using WHEN/THEN/AND scenarios
- `design.md` - Technical decisions and approach
- `tasks.md` - Implementation outline (reference only, not an execution tracker)

These are temporary reference documents. Delete the change directory after the Beads issue is closed.

### OpenSpec Config
`openspec/config.yaml` uses `schema: spec-driven`. The `context` field (currently commented out) should be populated with tech stack and conventions when application code is added.

### Beads Storage
- `.beads/issues.jsonl` - Git-tracked issue data (uses custom merge driver via `.gitattributes`)
- `.beads/beads.db` - Local SQLite database (git-ignored)
- `.beads/config.yaml` - Daemon and integration settings

## Session Completion Protocol

When ending a session, ALL of these steps are mandatory (see AGENTS.md):

1. File issues for remaining work
2. Run quality gates if code changed
3. Clean up completed OpenSpec change directories
4. Close finished Beads issues
5. **Push to remote** - work is NOT done until `git push` succeeds:
   ```bash
   git pull --rebase && bd sync && git push && git status
   ```
6. Clean up stashes/branches
7. Hand off context for next session
