# dependency-governance.md

Tracks dependency health and security.

## Checks

**Vulnerable Packages**
- Known CVEs
- Unpatched versions
- Deprecated packages

**Abandoned Packages**
- Last update > 1 year ago
- No maintainer activity
- Removed from npm

**Duplicates**
- Same library at different versions
- Conflicting versions
- Transitive duplicates

**Bloat**
- Oversized dependencies (> 500KB)
- Unnecessary dependencies
- Development dependencies in production

**Licensing**
- GPL licenses (if restrictive)
- Unknown licenses
- License conflicts

## Severity

| Issue | Severity |
|-------|----------|
| Active CVE | CRITICAL |
| Abandoned package | HIGH |
| GPL license conflict | HIGH |
| Duplicate versions | MEDIUM |
| Oversized dep | MEDIUM |

## Output

```
Dependency Governance Report

Issues: 8
- CRITICAL: 1 (CVE in lodash)
- HIGH: 2 (abandoned, GPL)
- MEDIUM: 5 (duplicates, size)

Findings:
1. lodash@4.17.19 has CVE [CRITICAL]
   → Remediation: Update to 4.17.21+

2. babel-core abandoned [HIGH]
   → Remediation: Replace with @babel/core

3. duplicates of react-query@3.x and @tanstack/react-query [MEDIUM]
   → Remediation: Consolidate to single version

4. date-fns bundle: 850KB [MEDIUM]
   → Remediation: Lazy load or tree-shake unused functions
```

## Automation

- npm audit
- Snyk scanning
- License checker
- Duplicate detector
- Bundle analyzer

Trigger: On PR, weekly scan
