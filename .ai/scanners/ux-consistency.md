# ux-consistency.md

Detects UI inconsistencies and accessibility issues.

## Checks

**Design Tokens**
- Colors not using token system
- Spacing not using scale
- Typography not following system
- Border radius inconsistent

**Component Consistency**
- Button sizes inconsistent
- Spacing inside components varied
- Text truncation inconsistent
- Icon sizes varied

**Responsive Design**
- Missing mobile breakpoints
- Broken on mobile
- Inconsistent breakpoint usage
- Missing tablet layout

**Accessibility**
- Low color contrast
- Missing alt text
- Non-semantic HTML
- Missing ARIA labels
- Non-keyboard-navigable
- Missing focus states

**Dark Mode**
- Colors not working in dark mode
- Text unreadable in dark mode
- Missing dark mode variants

## Severity

| Issue | Severity |
|-------|----------|
| WCAG AAA contrast violation | CRITICAL |
| Not mobile responsive | HIGH |
| Color not using tokens | MEDIUM |
| Missing alt text | MEDIUM |
| Inconsistent spacing | LOW |

## Output

```
UX Consistency Report

Issues: 18
- CRITICAL: 2 (contrast, mobile)
- MEDIUM: 10 (tokens, a11y)
- LOW: 6 (spacing, consistency)

Findings:
1. Button text contrast ratio 2.5:1 [CRITICAL]
   → Remediation: Increase contrast to 4.5:1

2. Hero image not responsive on mobile [CRITICAL]
   → Remediation: Add mobile layout

3. Colors hardcoded instead of tokens [MEDIUM]
   → Remediation: Use Tailwind tokens (12 instances)

4. Form inputs missing label tags [MEDIUM]
   → Remediation: Add semantic labels
```

## Automation

- axe accessibility scanner
- Contrast checker
- Responsive testing
- Token usage analysis

Trigger: On PR, design reviews
