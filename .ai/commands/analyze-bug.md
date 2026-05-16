# analyze-bug.md

Systematic root cause analysis and minimal fix.

## Objective

Find root cause, not symptom. Implement minimal safe fix. Prevent recurrence.

## Prerequisites

- Bug reproduced reliably
- Symptoms clearly described
- Access to relevant code/logs

## Workflow

**1. Define Symptom**
- What's broken?
- When started?
- Who affected?
- How reproducible?

**2. Gather Evidence**
- Check logs for errors
- Check metrics
- Reproduce locally
- Document reproduction steps

**3. Form Hypotheses**
- What could cause this symptom?
- List possibilities
- Rank by likelihood

**4. Test Hypotheses**
- Check code related to hypothesis
- Test in isolation if possible
- Gather proof
- Eliminate possibilities

**5. Identify Root Cause**
- Not the symptom, the actual problem
- Trace complete data flow
- Document the chain

**6. Design Minimal Fix**
- Smallest change that fixes root cause
- No refactoring
- No unrelated changes
- Doesn't hide problem

**7. Prevent Recurrence**
- Add test to catch if reoccurs
- Add monitoring alert
- Document in memory/known-bugs.md

## Output

```markdown
# Bug Fix: [Bug Description]

## Symptom
- What: [description]
- When: [when discovered]
- Who: [who affected]
- Reproducible: [yes/no, how often]

## Root Cause
[Complete explanation of why it happens]

## Reproduction Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Minimal Fix
[Code change explanation]

## Verification
- [ ] Bug no longer reproduces
- [ ] No new issues introduced
- [ ] Performance unaffected

## Prevention
- Added test: [test description]
- Added monitoring: [alert type]
```

## Success Criteria

- [ ] Root cause identified (not symptom)
- [ ] Bug reliably reproducible
- [ ] Fix is minimal (one concern)
- [ ] Fix doesn't introduce regressions
- [ ] Prevention in place

Used by: senior-debug-engineer role
Next: Test fix, commit, monitor
