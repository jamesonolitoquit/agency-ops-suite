# known-bugs.md

Recurring issues, workarounds, root causes.

## 1: Dark Mode Tailwind Classes Not Applied on First Load

**Symptom:** Component renders in light mode, then switches to dark after 1 second

**Root Cause:** CSS-in-JS initialization race condition. React hydrates before Tailwind fully loads.

**Affects:** ~2% of users with slow connections

**Workaround:** Add transition to prevent flash
```css
html {
  transition: background-color 0.3s;
}
```

**Status:** Backlog (low priority, visual only)

**Fix:** May need Tailwind v4 upgrade or preload CSS

---

## 2: [Future known issue]

**Symptom:** What users see

**Root Cause:** Why it happens

**Workaround:** How to avoid it

**Status:** In queue / Low priority / Accepted limitation

---

**Update when you discover recurring issues.**
