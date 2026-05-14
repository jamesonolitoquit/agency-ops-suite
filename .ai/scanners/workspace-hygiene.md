# workspace-hygiene.md

Detects code quality issues and repo entropy.

## Checks

**Dead Files**
- Unused components (no imports)
- Unused utilities (no imports)
- Orphaned pages/routes
- Abandoned branches

**Code Duplication**
- Identical functions
- Repeated logic patterns
- Duplicate dependencies

**Console & Debug**
- console.log statements
- debugger statements
- Commented-out code

**Unused Imports**
- Import but not used
- Dead code branches

**Code Size Issues**
- Components > 300 LOC
- Functions > 100 LOC (non-critical)

**TODO/FIXME Accumulation**
- Unaddressed TODOs > 30 days old
- Blocked items

**Empty Folders**
- Folders with no files
- Folders with only empty subfolders

## Severity

| Issue | Severity |
|-------|----------|
| console.log in production | HIGH |
| Dead components | MEDIUM |
| Duplicate functions | MEDIUM |
| Unused imports | LOW |
| Large components | MEDIUM |
| Old TODOs | LOW |

## Output

```
Workspace Hygiene Report

Issues: 12
- HIGH: 1 (console.log)
- MEDIUM: 5 (duplication, size)
- LOW: 6 (TODOs, unused imports)

Findings:
1. console.log in src/api/payments.ts:145 [HIGH]
2. Duplicate validateEmail in utils/ [MEDIUM]
3. LoginForm.tsx: 450 LOC [MEDIUM]
```

## Automation

- ESLint: no-console
- Custom scanner: detect dead code
- Size checker: LOC per file

Trigger: On PR, pre-commit
