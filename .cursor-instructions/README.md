# Cursor AI Instructions Folder

This folder contains all instructions for the 4-phase architecture reorganization.

## Files

1. **MASTER-GUIDE.md** - Start here! Main entry point for Cursor AI
2. **PHASE-SEQUENCE.md** - Execution order and phase details
3. **IMPLEMENTATION-DETAILS.md** - Quick reference with checklists
4. **ALL_IN_ONE_PROMPT_FA.md** - Complete Persian guide (copy from your documents)

## How to Use

Give Cursor this initial prompt:

```
Read and follow instructions in .cursor-instructions/ folder.
Start with MASTER-GUIDE.md.
```

Cursor will then:
1. Read all instruction files
2. Ask for confirmation to start Phase 1
3. Complete Phase 1
4. Ask for confirmation to start Phase 2
5. And so on...

## Rules

- Execute phases in order: 1 → 2 → 3 → 4
- Ask permission after each phase
- Do not delete old files
- Test before moving to next phase
