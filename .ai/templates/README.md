# Templates

Reusable file templates and scaffolding for consistent, high-quality code generation.

## Purpose

Templates provide:
- **Consistency** — Every file follows same structure
- **Completeness** — No forgotten pieces
- **Best Practices** — Baked into template
- **Speed** — Copy and fill in blanks
- **Quality** — High bar by default

Every file generated from a template meets baseline quality standards.

## Template Categories

### Component Templates
- `react-component.tsx` — Functional component with hooks
- `server-component.tsx` — Next.js Server Component
- `page-component.tsx` — Next.js page with layout

### API Templates
- `api-route.ts` — Next.js API route with auth/validation
- `database-query.ts` — Database operation with types
- `service.ts` — Business logic service class

### Test Templates
- `unit-test.test.ts` — Jest unit test
- `integration-test.test.ts` — Integration test
- `e2e-test.spec.ts` — Playwright e2e test

### Documentation Templates
- `README.md` — Module/component documentation
- `ARCHITECTURE.md` — System design documentation
- `API.md` — API endpoint documentation

### Configuration Templates
- `tsconfig.json` — TypeScript configuration
- `.env.local.example` — Environment variables
- `jest.config.js` — Jest test configuration

## Using Templates

1. **Copy template** to new location
2. **Replace placeholders** (marked with `<...>`)
3. **Fill in specifics** (names, descriptions, logic)
4. **Delete unused sections** (marked with "optional")
5. **Run linter** to ensure consistency

## React Component Template

```typescript
// File: src/components/<ComponentName>/<ComponentName>.tsx

import { FC } from 'react';
import { type <ComponentName>Props } from './types';
import * as S from './<ComponentName>.styles';

/**
 * <ComponentName> - <Brief description of purpose and behavior>
 * 
 * Usage:
 * ```tsx
 * <ComponentName prop1="value" />
 * ```
 * 
 * @component
 */
export const <ComponentName>: FC<<ComponentName>Props> = ({
  required,
  optional = 'default',
}) => {
  // Hooks and state
  
  // Computed values
  
  // Event handlers
  
  // Render
  return (
    <S.Root>
      {/* Content */}
    </S.Root>
  );
};
```

## API Route Template

```typescript
// File: src/app/api/<route>/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticateRequest } from '@/lib/auth';
import { validateRequest } from '@/lib/validation';
import { logger } from '@/lib/logger';

/**
 * <Method> /api/<route>
 * 
 * Purpose: <What does this endpoint do?>
 * 
 * @requires Authentication: <jwt | session | public>
 * @param <Param>: <Type> - <Description>
 * @returns <Type> - <Description>
 */
export async function <METHOD>(request: NextRequest) {
  try {
    // 1. Authenticate
    const { user, error: authError } = await authenticateRequest(request);
    if (authError) {
      logger.warn('Auth failed', { authError });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    const validation = validateRequest(body, schema);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.errors },
        { status: 400 }
      );
    }

    // 3. Execute business logic
    const result = await <businessLogicFunction>(
      body,
      user
    );

    // 4. Return response
    return NextResponse.json(
      { data: result },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Route error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Unit Test Template

```typescript
// File: src/__tests__/utils/<functionName>.test.ts

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { <functionName> } from '@/utils/<functionName>';

describe('<functionName>', () => {
  // Setup/teardown
  beforeEach(() => {
    // Reset state, clear mocks
  });

  afterEach(() => {
    // Cleanup
  });

  describe('happy path', () => {
    it('should <expected behavior> when <conditions>', () => {
      // Arrange
      const input = { /* test data */ };
      const expected = { /* expected result */ };

      // Act
      const result = <functionName>(input);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('error cases', () => {
    it('should throw when <condition>', () => {
      // Arrange
      const invalidInput = { /* invalid data */ };

      // Act & Assert
      expect(() => <functionName>(invalidInput)).toThrow();
    });
  });
});
```

## Guidelines for Templates

- **Placeholder Style** — Use `<PlaceholderName>` format
- **Comments** — Explain what to fill in
- **Best Practices** — Include error handling, types, etc.
- **Keep It Real** — Not too minimal, but not bloated
- **Update Regularly** — Keep templates current with standards

Templates are your quality amplifier.
