# plan-feature.md

Design a feature end-to-end before implementation.

## Objective

Produce architecture document with all decisions made before code begins.

## Prerequisites

- Feature description clear
- Context loaded (project-context.md)
- system-architect role active

## Workflow

**1. Define Requirements**
- What problem does feature solve?
- Who uses it?
- Success criteria (quantified if possible)

**2. Design API**
- Endpoints needed (if backend)
- Request/response schemas
- Error responses

**3. Design Database**
- Tables/collections needed
- Relationships
- Constraints

**4. Design UI** (if applicable)
- Pages/components needed
- Layout approach
- Responsive strategy

**5. Identify Dependencies**
- What services does this use?
- What services depend on this?
- Third-party integrations needed?

**6. Phasing Plan**
- MVP scope (Phase 1)
- Phase 2 scope
- Nice-to-have scope

**7. Trade-off Analysis**
- What choices did we make?
- Why not alternatives?
- What are trade-offs?

**8. Risk Assessment**
- What could go wrong?
- How severe?
- Mitigation plans

## Output

```markdown
# Feature Plan: [Feature Name]

## Summary
One paragraph describing what we're building.

## Requirements
- Req 1
- Req 2

## API Design
```
POST /api/[resource]
{
  field1: type,
  field2: type
}
→ { id, field1, field2, createdAt }
```

## Database Schema
[Table definitions with relationships]

## UI Design
[Component structure, responsive breakpoints]

## Dependencies
- Services used
- Third-party APIs
- Data flow

## Phasing
Phase 1: MVP
- [features]

Phase 2: Polish
- [features]

## Trade-offs
- Decision 1: Chose X over Y because [reason]
- Decision 2: Chose X over Y because [reason]

## Risks
- Risk 1: [mitigation]
- Risk 2: [mitigation]
```

## Success Criteria

- [ ] Requirements clearly defined
- [ ] API contracts specified
- [ ] Database design reviewed
- [ ] No major ambiguities
- [ ] Phasing makes sense
- [ ] Team aligned on trade-offs

Used by: system-architect role
Next: workflow-dispatcher → implement phase
