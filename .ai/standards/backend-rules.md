# backend-rules.md

Backend implementation patterns and constraints.

## Service Layer

- Services handle business logic
- One service per domain
- Services don't know about HTTP
- Services are testable independently

```typescript
export class UserService {
  async createUser(data: CreateUserInput): Promise<User> {
    // Business logic here, not HTTP handling
  }
}
```

## API Routes

- Routes delegate to services
- Minimal logic in routes
- Routes handle HTTP, not business logic
- Validate input at route level

```typescript
export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = await userService.createUser(body);
  return NextResponse.json(data);
}
```

## Database

- Use parameterized queries (prevent SQL injection)
- Index frequently queried fields
- Avoid N+1 queries (use joins)
- Add soft deletes where appropriate
- Document schema

```typescript
// ✓ CORRECT
const users = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ✗ INCORRECT
const users = await db.query(
  `SELECT * FROM users WHERE id = '${userId}'`
);
```

## Error Handling

- Validate inputs server-side
- Return descriptive errors
- Log errors for debugging
- Don't expose stack traces to clients

```typescript
try {
  // business logic
} catch (error) {
  logger.error('Operation failed', { error });
  return NextResponse.json(
    { error: 'Operation failed' },
    { status: 500 }
  );
}
```

## Testing

- Unit test services
- Integration test routes
- Test error cases
- Test permissions

## Performance

- Cache frequently accessed data
- Use database indexes
- Optimize queries
- Paginate large results

## Enforcement

- Code review
- Test coverage
- Performance profiling
