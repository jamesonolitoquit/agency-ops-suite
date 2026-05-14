# naming-conventions.md

Consistent naming across codebase.

## Files

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `LoginForm.tsx` |
| Hooks | camelCase, use prefix | `useAuth.ts` |
| Utilities | camelCase | `validateEmail.ts` |
| Types | PascalCase | `User.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES.ts` |
| Tests | same + `.test.ts` | `LoginForm.test.tsx` |

## Variables & Functions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `const userEmail = ...` |
| Functions | camelCase | `function validateInput() {}` |
| Classes | PascalCase | `class UserService {}` |
| Constants | UPPER_SNAKE_CASE | `const MAX_SIZE = 100` |
| Booleans | `is/has` prefix | `isLoading`, `hasError` |
| Callbacks | `on` prefix | `onClick`, `onSubmit` |
| Handlers | `handle` prefix | `handleClick`, `handleSubmit` |

## CSS & Classes

| Type | Convention | Example |
|------|-----------|---------|
| Tailwind | kebab-case (inline) | `className="flex gap-2"` |
| CSS modules | camelCase | `styles.formContainer` |
| BEM (if used) | Block__Element--Modifier | `form__input--error` |

## Imports

```typescript
// Grouped by: external, internal, types
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/User';
```

## Abbreviations

- ✓ Allowed: `id`, `url`, `api`, `db`
- ✗ Avoid: `u` for user, `info` for information, `tmp` for temporary

## Enforcement

- ESLint naming-convention rule
- Pre-commit linting
- Code review
