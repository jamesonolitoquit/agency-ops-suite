# Context Router — Primary Orchestration Engine

Routes tasks into minimal, deterministic execution contexts.

## Philosophy

- **Never load unnecessary context**
- **Classify first, load second**
- **Isolate execution domains**
- **Minimize role activation**
- **Aggressive context pruning**

## Execution Pipeline

```
1. Task arrives
2. Analyze intent (keywords, domain signals)
3. Classify into execution domain(s)
4. Calculate minimal context scope
5. Determine affected systems/files
6. Load only required role(s)
7. Select appropriate workflow
8. Load relevant standards only
9. Execute implementation
10. Run targeted scanners only
11. Prune reasoning artifacts
12. Output result
```

## Routing Strategy

### Single-Domain Tasks
- Load ONE domain's context
- Activate primary role only
- Load related standards only
- Run domain-specific scanners

### Multi-Domain Tasks
- Merge contexts WITHOUT duplication
- Prioritize by impact (security > architecture > performance > UI)
- Load shared standards once
- Coordinate role execution
- Run all relevant scanners

## Anti-Bloat Rules

**NEVER:**
- Load full repository context
- Activate unrelated roles
- Mix unrelated standards
- Run all scanners for every task
- Keep reasoning artifacts after execution

**ALWAYS:**
- Calculate execution scope first
- Validate role relevance
- Check context size before loading
- Prune after decision-making
- Document routing decision

## Routing Matrix

| Domain | Primary Role | Secondary Roles | Standards | Scanners |
|--------|-------------|-----------------|-----------|----------|
| UI_IMPLEMENTATION | ui-systems-engineer | backend-api-architect (API) | component-standards, ui-design-system | ux-consistency, performance-audit |
| BACKEND_ENGINEERING | backend-api-architect | security-engineer (if auth) | api-standards, backend-rules | architecture-guardian, test-integrity |
| SECURITY_AUDIT | security-engineer | system-architect | security-standards | security-boost, dependency-governance |
| DEBUGGING | senior-debug-engineer | relevant domain role | — | — |
| FEATURE_PLANNING | system-architect | backup role | architecture-rules | architecture-guardian |
| PERFORMANCE | performance-engineer | ui-systems-engineer (UI) / backend-api-architect (API) | — | performance-audit |
| REFACTORING | system-architect | domain-specific role | architecture-rules | architecture-guardian, workspace-hygiene |
| DEPLOYMENT | deployment-engineer | security-engineer | — | deployment-readiness |
| TESTING | qa-specialist | domain-specific role | — | test-integrity |
| DOCUMENTATION | backend-api-architect / ui-systems-engineer | — | — | — |

## Context Load Limits

- **Max roles active:** 2 (priority + specialist)
- **Max standards loaded:** 3
- **Max scanners activated:** 2
- **Max context files:** 4
- **Max reasoning retention:** 1 decision per artifact

## Implementation Example

```
User: "Fix the login form mobile layout"

1. Task Analysis:
   Keywords: fix, mobile, layout → UI_IMPLEMENTATION
   
2. Domain Classification:
   Domain: UI_IMPLEMENTATION
   Affected systems: src/components/LoginForm
   
3. Context Calculation:
   Load: ui-systems-engineer role
   Skip: backend-api-architect
   Standards: component-standards, ui-design-system
   Scanners: ux-consistency (responsive), performance-audit (bundle)
   
4. Execution:
   - Run command: implement-component (within ui-systems-engineer)
   - Load only LoginForm context
   - Don't touch authentication logic
   - Don't scan backend
   
5. Validation:
   - ux-consistency scanner runs
   - Verify mobile breakpoints
   - Verify responsive behavior
   
6. Cleanup:
   - Discard intermediate reasoning
   - Keep only: implementation, test results
   - Output: PR-ready code
```

## Emergency Override

If user specifies: "Full audit, ignore all optimization"
- Load all scanners
- Activate all relevant roles
- Override context minimization
- Document override reason

## Integration Points

- Loads from: task-classifier.md, role-orchestrator.md, context-loader.md
- Outputs to: workflow-dispatcher.md
- Validates with: execution-scope-manager.md
- Compresses with: context-pruner.md
