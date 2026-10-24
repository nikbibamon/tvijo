---
title: Billing and budgets
slug: billing-and-budgets
order: 4
status: live
description: >
  How Tvijo separates provider spend from its own services, how budgets are
  enforced, and what "unpriced call" means.
---

# Billing and budgets

Tvijo is not a token reseller. The money flows are separated on purpose.

**Status:** live today for the split; pilot/design for some parts below.

## Whose money is whose

- **BYOK spend** — you pay your provider directly. Tvijo does not mark up model
  tokens.
- **Platform spend** — calls that ran on a platform key (our own features).
- **Unpriced calls** — calls recorded before pricing was known. They are shown
  as `0` honestly: the model price was unknown, not "free".

The workspace reports `byok_spend`, `platform_spend` and `unpriced_calls`
separately, so a BYOK customer is never led to believe Tvijo's spend is theirs.

## Budget policy

- daily limit;
- monthly limit;
- per-request limit;
- hard stop when a cap is reached.

When a cap is reached the call is **refused before spend**, and the interface
tells you to raise the limit — it does not suggest retrying.

## Fail-closed rule

On any path where a model is called **not** by a human click (indexing,
moderation, classification in a loop), spending is allowed only under a daily
cap and with a `session_id` on every call. If the spend cannot be computed, the
call is not made.

## Payment ledger

There is no self-service payment ledger yet — pilots are invoiced manually.
The interface does not draw an invoice, a credit balance, savings or a paid
status until a real ledger exists. **Status:** design.
