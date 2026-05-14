# test-integrity.md

Validates test coverage and quality.

## Checks

**Coverage Gaps**
- Untested files
- Coverage < 80%
- Critical paths untested

**Weak Tests**
- Tests with no assertions
- Too-specific tests (brittle)
- Missing edge cases
- Mock abuse (everything mocked)

**Flaky Tests**
- Tests that sometimes fail
- Random timeouts
- Date/time dependencies
- Uncontrolled external calls

**Skipped Tests**
- `.skip()` or `.only()` in code
- Disabled test suites

**E2E Gaps**
- Critical user flows not tested
- Payment flow not tested
- Auth flow incomplete

## Severity

| Issue | Severity |
|-------|----------|
| Critical path untested | CRITICAL |
| Coverage < 50% | HIGH |
| Flaky test | HIGH |
| Weak assertions | MEDIUM |
| Edge case missing | MEDIUM |

## Output

```
Test Integrity Report

Metrics:
- Coverage: 76% [MEDIUM - should be > 80%]
- Flaky tests: 2 detected
- Skipped tests: 3 found

Issues:
1. Payment processing not covered by e2e [CRITICAL]
   → Remediation: Add payment flow test
   
2. Auth reducer has < 50% coverage [HIGH]
   → Remediation: Add test cases for all paths
   
3. useForm hook test flaky (timeout) [HIGH]
   → Remediation: Add proper wait/mock delays

4. Mock overuse in UserService tests [MEDIUM]
   → Remediation: Test real database behavior
```

## Automation

- Coverage threshold (80%)
- Flake detection
- Jest config validation
- Test name scanning

Trigger: On PR, pre-commit
