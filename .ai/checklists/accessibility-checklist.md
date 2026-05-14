# accessibility-checklist.md

WCAG 2.1 AA compliance validation.

## Keyboard Navigation

- [ ] All interactive elements focusable
- [ ] Focus visible (not invisible)
- [ ] Tab order logical
- [ ] Keyboard shortcuts not conflicting
- [ ] Escape key closes dialogs/menus
- [ ] Enter key submits forms

## Screen Reader Support

- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Images have alt text
- [ ] Form labels associated with inputs
- [ ] ARIA landmarks defined
- [ ] Hidden content marked properly
- [ ] Live regions announced

## Visual Design

- [ ] Color contrast >= 4.5:1 (normal text)
- [ ] Color contrast >= 3:1 (large text)
- [ ] Not relying on color alone
- [ ] Visual focus indicator
- [ ] Resizable text possible

## Forms

- [ ] All inputs have labels
- [ ] Error messages clear
- [ ] Error messages linked to fields
- [ ] Required fields marked
- [ ] Instructions clear
- [ ] Form recovers on error

## Media

- [ ] Images have alt text
- [ ] Videos have captions
- [ ] Videos have transcripts
- [ ] Audio has transcripts
- [ ] Avoid flashing content (> 3/sec)

## Responsive Design

- [ ] Works at 200% zoom
- [ ] Works at 400% zoom
- [ ] Works on small screens (320px)
- [ ] Touch targets >= 44x44px
- [ ] No horizontal scroll needed

## Structure

- [ ] Headings hierarchical (h1, h2, etc)
- [ ] No skipped heading levels
- [ ] Lists use semantic markup
- [ ] Tables have headers
- [ ] Page title descriptive

## Tools Testing

- [ ] axe DevTools: no violations
- [ ] WAVE: no errors
- [ ] Lighthouse: no issues
- [ ] Manual screen reader test
- [ ] Manual keyboard test

---

**All items must pass before launch.**
