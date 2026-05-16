# Context Pruner — Reasoning Compression Engine

Aggressively compresses context after decisions to prevent bloat.

## Purpose

- Remove intermediate reasoning
- Keep only conclusions and code
- Prevent token waste
- Enable long-session stability
- Compress for next agent handoff

## Pruning Triggers

Prune context when:
- Decision made (keep decision, discard deliberation)
- Stage complete (keep output, discard process)
- Role handoff (keep requirements, discard reasoning)
- Session milestone (every 5 major tasks)
- Context limit approached (> 100KB)

## Pruning Rules

### Keep ✓
- **Final decisions** (API design, architecture choices)
- **Code implemented** (final implementation only)
- **Test results** (pass/fail status)
- **Constraints discovered** (for future tasks)
- **Architectural patterns** (reusable insights)
- **Security findings** (vulnerabilities, fixes)
- **Optimization results** (before/after metrics)

### Remove ✗
- **Intermediate reasoning** (why I considered X)
- **Dead ends explored** (approaches rejected)
- **Deliberation details** (pros/cons analysis)
- **Conversation filler** (pleasantries, explanations)
- **Exploratory analysis** (research notes)
- **Rejected code** (didn't use this approach)
- **Debugging steps** (once bug is fixed)

### Archive ⤴
- **Decisions for memory** → save to memory/architectural-decisions.md
- **Failed approaches** → save to memory/failed-approaches.md
- **Performance improvements** → save to memory/optimization-history.md
- **Issues found** → save to memory/known-bugs.md

## Pruning Examples

### Before (Full Reasoning)
```
I considered three approaches:
1. Using Context API - too much boilerplate
2. Using Redux - overkill for this use case
3. Using Zustand - minimal, TypeScript friendly

After weighing pros and cons, I chose Zustand because:
- Smaller bundle
- Less boilerplate
- Good TypeScript support
- Easier testing

Here's the implementation:
[code]

The implementation follows X pattern because [explanation].
```

### After (Pruned)
```
Decision: Use Zustand for state management.

Implementation:
[code]

Rationale: Minimal boilerplate, TypeScript-friendly, smaller bundle.
```

## Compression Algorithm

```
1. Identify decision/output/code
2. Remove: explanation of reasoning
3. Remove: comparison of alternatives
4. Remove: justification of choice
5. Keep: final decision + rationale (1 line)
6. Keep: code/output
7. Archive: patterns for future reference
8. Output: compressed artifact
```

## Session Compression

Every 5 major tasks (or at milestone):
```
1. Extract all decisions from session
2. Extract all constraints discovered
3. Extract all patterns used
4. Archive decisions to memory/
5. Reset reasoning artifacts
6. Keep only: decisions, code, constraints
7. Fresh context for next 5 tasks
```

## Handoff Compression

When handing off to next role:
```
From current role:
- Problem solved: [concise]
- Decision made: [concise]
- Code produced: [code]
- Constraints: [bullet list]
- Next step: [clear]

Remove: how I got there, alternatives considered, ...
```

## Memory Extraction

When pruning, extract reusable patterns:

```
Pruning: "I optimized React rerenders by..."

Extract to: memory/optimization-history.md
- Optimization: Memoized list component
- Before: 1200ms render time
- After: 200ms render time
- Technique: React.memo + useCallback
```

## Context Size Monitoring

```
Session start: 50KB loaded context
After 5 tasks: 150KB (approaching limit)
→ Trigger compression
After pruning: 60KB (reset to baseline)
Continue work
```

## Aggressive Compression Rules

If context still too large after normal pruning:

1. Keep ONLY:
   - Current code being worked on
   - Active decisions
   - Current role definition

2. Archive to memory:
   - Architectural patterns
   - Performance insights
   - Security findings

3. Delete:
   - Previous task details
   - Exploratory analysis
   - Comparison matrices
   - Explanation details

## Emergency Prune

If context critical (> 200KB):
- Delete: ALL intermediate reasoning
- Delete: ALL explanations
- Keep: ONLY code and decisions
- Ask: "Split into smaller tasks?"

## Pruning Output

```json
{
  "before_size_kb": 145,
  "after_size_kb": 62,
  "compression_ratio": 0.57,
  "kept": {
    "decisions": 3,
    "code_files": 5,
    "constraints": 4
  },
  "removed": {
    "reasoning_artifacts": 12,
    "explanations": 8,
    "dead_ends": 5
  },
  "archived_to_memory": {
    "architectural_decisions": 1,
    "optimization_patterns": 1,
    "constraints": 2
  }
}
```

## Integration

- Triggered by: context-router.md after stage completion
- Runs after: role execution, workflow completion
- Interacts with: memory system
- Outputs to: session artifact (reduced context)

Use aggressive pruning. Long-session stability depends on it.
