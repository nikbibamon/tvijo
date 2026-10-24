---
title: Documentation
slug: index
order: 0
status: live
description: >
  Product and API documentation for Tvijo — the control plane for model
  routing, budgets, guardrails and audit evidence.
---

# Tvijo documentation

Tvijo is a control plane for AI: you bring your own model provider key (BYOK),
and Tvijo adds routing, budgets, guardrails, approvals and an append-only audit
trail on top. This documentation is for developers and operators who use the
product directly.

## What is where

| Surface | URL | Purpose |
|---|---|---|
| Documentation (this section) | `/[locale]/docs` | Product and API reference |
| Knowledge Base | `/[locale]/kb` | Educational articles and guides |
| Workspace (control plane) | `/[locale]/workspace` | Your private control plane after login |
| Solutions | `/[locale]/solutions` | Buyer-motive pages with real capability status |

## Conventions

### Status badges

Every capability in these docs carries a real status, matching the product:

- **Live today** — shipped code that works right now.
- **Pilot scope** — delivered inside a limited pilot, not generally available.
- **Design intent** — designed, not yet built.

A capability without a status is a documentation bug.

### Untranslated terms

These terms are kept verbatim in every language:

`BYOK`, `OpenRouter`, `ZDR`, `allowlist`, `rollback`, `evidence`, `guardrails`,
model names, API enum values, shell fragments and currency amounts.

### Translation workflow

English is the canonical language. Each document is self-contained so it can be
translated without cross-references breaking.

1. Copy `doc.md` to `doc.uk.md` (or `doc.ru.md`) and translate the body.
2. Keep frontmatter keys and any verbatim terms unchanged.
3. Machine translation (DeepSeek) is draft only — it is never published before
   a human reviews `approval`, `rollback`, `evidence`, `BYOK`, `revocation`,
   `read-only` and the claims statuses.

## File layout

```text
src/content/docs/
  README.md                 # conventions (this file)
  getting-started.md
  connect-a-provider.md
  models.md
  billing-and-budgets.md
  managed-ai-operations.md
```
