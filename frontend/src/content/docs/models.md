---
title: Models and routing
slug: models
order: 3
status: live
description: >
  How the model allowlist works, which models are allowed today, and how to
  validate the list against the live catalog.
---

# Models and routing

Tvijo works from an **allowlist**, not from the entire provider catalog. You can
only route to a model that is present in the allowed list.

**Status:** live today.

## Current allowlist

Verified 2026-08-28:

| Model | Role | Notes |
|---|---|---|
| `z-ai/glm-5.3-flash` | fast | tools, `response_format`, ZDR endpoint |
| `google/gemini-3.7-flash` | balanced default | tools, `response_format`, ZDR endpoint |
| `z-ai/glm-5.3` | reasoning | tools, `response_format`, ZDR endpoint |

## What is not allowed

- `openrouter/auto` and other mutable model aliases;
- arbitrary models outside the allowlist;
- client-side fallback chains between models.

## Validating the allowlist

The catalog is mutable — a model slug can disappear or change its routing
constraints. Run this after any allowlist change and periodically:

```bash
./manage.py check_openrouter          # table report
./manage.py check_openrouter --json   # machine-readable
```

The check is read-only, spends no tokens, and exits non-zero when a model is
missing, when the default model is outside the allowlist, or when `zdr=true` but
a model has no zero-data-retention endpoint.
