# Orchestrators — AI Execution Kernel

Deterministic routing engine. Routes tasks into minimal, isolated execution contexts.

## Core System

**Execution Pipeline:**
```
Task → Classify → Scope → Load Context → Activate Roles → Dispatch Workflow → Execute → Prune
```

## Files

- **context-router.md** — Primary orchestration engine. Routes tasks deterministically.
- **task-classifier.md** — Domain detection. Maps tasks to 10 execution domains.
- **context-loader.md** — Selective loading. Loads ONLY minimal viable context.
- **execution-scope-manager.md** — Boundary calculator. Determines what files/systems affected.
- **role-orchestrator.md** — Role activation. Determines which AI roles execute (max 2).
- **workflow-dispatcher.md** — Pipeline selector. Maps tasks to multi-stage workflows.
- **context-pruner.md** — Reasoning compression. Removes intermediate artifacts post-execution.

## Routing Philosophy

- **Never load unnecessary context**
- **Classify first, load second**
- **Isolate execution domains**
- **Minimize role activation (max 2)**
- **Aggressive context pruning**
- **Max context per session: 100KB**

## Example Flow

```
User: "Fix mobile login responsiveness"

→ task-classifier: Domain = UI_IMPLEMENTATION
→ execution-scope-manager: Scope = src/components/LoginForm/
→ context-loader: Load = ui-systems-engineer role, UI standards
→ role-orchestrator: Activate = ui-systems-engineer only
→ workflow-dispatcher: Workflow = build-feature (UI phase only)
→ Execute: Implement responsive LoginForm
→ context-pruner: Remove reasoning, keep code
→ Output: PR-ready component
```

## Anti-Bloat Guarantees

- Load by domain, not "everything"
- Activate ONLY relevant roles
- Exclude unrelated documentation
- Prevent recursive context explosion
- Prune after each major task

## Integration Points

- **Input:** User request
- **Output:** Executed task, code, reports
- **Feedback loop:** Memory system for patterns
- **Error handling:** Graceful degradation
- **Context limit:** Hard stop at 150KB
