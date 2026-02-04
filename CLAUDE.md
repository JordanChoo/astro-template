# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a workflow infrastructure repository using two integrated systems:
- **Beads** (`bd` CLI) - AI-native issue tracking that lives in git (`.beads/`)
- **OpenSpec** - Artifact-driven development workflow (`openspec/`, `.claude/skills/`, `.claude/commands/opsx/`)

There is no application code, build system, or package manager. The project consists of YAML configs, markdown documentation, and Claude skill definitions.

## Key Commands

### Beads Issue Tracking
```bash
bd onboard                          # First-time setup
bd ready                            # Find available work
bd show <id>                        # View issue details
bd update <id> --status in_progress # Claim work
bd close <id>                       # Complete work
bd sync                             # Sync with git
bd create <title>                   # File new issue
```

### OpenSpec Workflow (via slash commands)
```
/opsx:explore     # Thinking mode - investigate before changing
/opsx:new         # Start new change (step-by-step artifact creation)
/opsx:ff          # Start new change (fast-forward - all artifacts at once)
/opsx:continue    # Create next artifact for existing change
/opsx:apply       # Implement tasks from a change
/opsx:verify      # Validate implementation completeness
/opsx:archive     # Archive completed change
/opsx:sync        # Sync delta specs to main specs
/opsx:onboard     # Guided tutorial
```

## Architecture

### OpenSpec Artifact Flow
Changes follow a strict dependency order: **Proposal → Specs → Design → Tasks → Apply → Verify → Archive**

Each change lives in `openspec/changes/<name>/` with:
- `proposal.md` - Why, what capabilities, impact
- `specs/<capability>/spec.md` - Requirements using WHEN/THEN/AND scenarios
- `design.md` - Technical decisions and approach
- `tasks.md` - Checkboxed implementation steps

On archive, changes move to `openspec/changes/archive/YYYY-MM-DD-<name>/` and delta specs merge into `openspec/specs/`.

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
3. Update issue statuses
4. **Push to remote** - work is NOT done until `git push` succeeds:
   ```bash
   git pull --rebase && bd sync && git push && git status
   ```
5. Clean up stashes/branches
6. Hand off context for next session
