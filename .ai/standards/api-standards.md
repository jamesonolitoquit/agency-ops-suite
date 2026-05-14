# api-standards.md

REST API design principles.

## Endpoints

**Naming:**
- Plural resource names: `/api/users` (not `/api/user`)
- Descriptive actions: `/api/users/login` (not `/api/doLogin`)
- Versioning: `/api/v1/users` (if needed)

**Methods:**
- GET: Retrieve resource
- POST: Create resource
- PUT/PATCH: Update resource
- DELETE: Delete resource

## Responses

**Success (2xx):**
```json
{
  "data": { /* resource */ },
  "meta": { "page": 1, "total": 100 }
}
```

**Error (4xx/5xx):**
```json
{
  "error": "Error message",
  "code": "VALIDATION_ERROR",
  "details": { "field": "Error details" }
}
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 409: Conflict
- 500: Server error

## Authentication

- All endpoints require auth (except login, signup)
- Use Bearer token in Authorization header
- Validate auth on every request

## Validation

- Validate ALL inputs server-side
- Return descriptive validation errors
- Include field-specific error details

## Pagination

```json
{
  "data": [/* items */],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

## Rate Limiting

- Limit unauthenticated endpoints (100 req/hour)
- Limit authenticated endpoints (1000 req/hour)
- Return 429 status when exceeded

## Enforcement

- Code review
- API documentation
- Test coverage
