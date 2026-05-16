# root-cause-analysis.md

Systematic debugging methodology.

## Procedure

### 1. Define the Symptom
- What went wrong?
- When did it start?
- Who does it affect?
- How reproducible?

### 2. Gather Evidence
- Check error logs
- Check metrics/monitoring
- Reproduce locally if possible
- Get exact error messages

### 3. Form Hypotheses
- What could cause this symptom?
- List 3-5 possibilities
- Rank by likelihood

### 4. Test Hypotheses
- Examine related code
- Check configuration
- Test in isolation
- Gather proof for each

### 5. Identify Root Cause
- Answer: WHY does the problem happen?
- Not just: what's broken
- Document the chain

### 6. Design Minimal Fix
- Smallest possible change
- Doesn't refactor
- Doesn't hide problem
- Targets root cause

### 7. Prevent Recurrence
- Add test to catch it
- Add monitoring alert
- Document in known-bugs.md

## Example

```
Symptom: "Form submission hangs"

Evidence:
- Logs show request never returns
- Network tab: request pending 60+ seconds
- Error: timeout
- Reproducible: always with large files

Hypotheses:
1. File upload too slow ← Test this
2. Server processing too slow
3. Connection timeout
4. Browser bug

Testing:
- Check upload time: 2s (not slow)
- Check server logs: No processing logs appear
- Conclusion: Request never reaches server

Root Cause:
- File larger than nginx upload limit
- Nginx rejects silently
- Browser waits indefinitely

Minimal Fix:
- Add file size validation before upload
- Show error to user: "File too large"

Prevention:
- Add client-side size check
- Add server-side size check
- Add unit test
- Add monitoring alert
```

## Anti-Patterns

- ❌ Guessing at causes
- ❌ Fixing symptoms only
- ❌ Making broad changes
- ❌ Not testing the fix
- ❌ Ignoring error logs
- ❌ Not documenting findings
