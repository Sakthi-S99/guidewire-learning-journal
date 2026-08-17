# RCA Template

> Copy this file for every new incident. File naming: `YYYY-MM-DD-short-description.md`

---

## Summary

_One sentence: what broke, in which module, with what business impact._

---

## Issue

**Component:** `<!-- e.g. InvoiceDueDate calculation, PaymentPlan charge generation -->`  
**Environment:** `<!-- DEV / QA / UAT / PROD -->`  
**Detected:** `<!-- Date -->`  
**Severity:** `<!-- P1 / P2 / P3 -->`

---

## Expected Behavior

_What should have happened, from both a business and technical perspective._

---

## Actual Behavior

_What actually happened. Include any error messages, stack traces, or incorrect data._

```
<!-- Paste stack trace or error log here -->
```

---

## Root Cause

_The precise technical reason — not symptoms, the actual cause._

!!! note "Key Insight"
    _Highlight the single most important finding here._

---

## Business Impact

- Policies affected:
- Financial impact:
- User impact:
- SLA breach: Yes / No

---

## Fix

### Approach

_Why this fix was chosen over alternatives._

### Code Changes

```gosu
// Reason For Change: 
// Edge Case:

// BEFORE
// ...

// AFTER
// ...
```

### Files Changed

| File | Change Type | Notes |
|---|---|---|
| | | |

---

## Risks & Regression

| Risk | Likelihood | Mitigation |
|---|---|---|
| | | |

---

## Test Scenarios

- [ ] Happy path: ...
- [ ] Edge case: ...
- [ ] Regression: ...

---

## Timeline

| Time | Event |
|---|---|
| | Issue detected |
| | Investigation started |
| | Root cause identified |
| | Fix deployed |
| | Verified in production |

---

## Lessons Learned

_What would have prevented this? What will you do differently?_

---

*Tags: `<!-- rca, invoicing, payment-plans, delinquency, gosu, integration -->`*
