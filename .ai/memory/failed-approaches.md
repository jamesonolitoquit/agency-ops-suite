# failed-approaches.md

What we tried that didn't work and lessons learned.

## 1: Client-Side Form Validation Only

**Context:** Trying to validate quickly on frontend

**What we tried:** Form component validated all inputs, planned server validation for "later"

**What happened:**
- Data inconsistencies in database
- Edge cases bypassed form validation
- API endpoints accepted invalid data

**Why it failed:** Validation is business logic, not just UX

**Lesson learned:** Always validate server-side. Client validation is UX only.

**What to do instead:**
```typescript
// Client: For UX feedback
if (!email.includes('@')) {
  showError('Invalid email');
}

// Server: For truth
const schema = z.object({
  email: z.string().email(),
});
```

---

## 2: [Future failed approach]

**Context:** Why we tried this

**What we tried:** Description

**Result:** What happened

**Lesson:** What we learned

---

**Add new entries when you discover better approaches.**
