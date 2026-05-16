# component-standards.md

React component structure and patterns.

## File Structure

```
src/components/ComponentName/
├── ComponentName.tsx          # Component definition
├── ComponentName.test.tsx     # Tests
├── types.ts                   # Component-specific types
├── hooks.ts                   # Component-specific hooks
└── README.md                  # Documentation (if complex)
```

## Component Definition

```typescript
import { FC } from 'react';
import type { ComponentNameProps } from './types';

/**
 * ComponentName - Brief description of what it does.
 * 
 * Features:
 * - Feature 1
 * - Feature 2
 */
export const ComponentName: FC<ComponentNameProps> = ({
  required,
  optional = 'default',
}) => {
  // ...
  return null;
};
```

## Props

- Keep props minimal (< 7 props)
- Use destructuring
- Define interfaces for complex props
- Document props with types

## Hooks Usage

- Use hooks for state (useState, useReducer)
- Use custom hooks for logic reuse
- Use context only for cross-tree prop drilling (> 3 levels)
- Don't nest hooks conditionally

## Performance

- Use React.memo for expensive components
- Use useCallback for callbacks
- Use useMemo for expensive computations
- Profile before optimizing

## Accessibility

- Use semantic HTML (`<button>`, `<input>`, etc)
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen reader

## Max Sizes

- Component LOC: < 300 (split into smaller)
- Props: < 7 (use object prop)
- Nesting: < 5 levels (extract components)

## Enforcement

- Component review
- Linting
- Performance tests
