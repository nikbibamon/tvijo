---
title: Pricing model
slug: pricing-model
order: 6
status: live
description: >
  How Tvijo charges: BYOK with no token markup, a control-plane fee, and our
  own published AI bill as the proof of spend discipline.
---

# Pricing model

Tvijo does not resell model tokens. The money is split on purpose.

**Status:** live today for the split; some items below are design.

## No token markup

You pay your provider directly through your own key (**BYOK**). Tvijo does not
add a margin to model usage — a claim OpenRouter-style gateways cannot make,
because their revenue is the margin.

## What Tvijo charges for

The control plane, not the tokens:

- routing, budgets and guardrails;
- approvals and the audit trail;
- evidence bundles and (later) managed server operations.

Provider usage and Tvijo services are reported as separate lines —
`byok_spend`, `platform_spend` and `unpriced_calls`.

## Public prices

No public price list is published until a payment ledger exists. Pilots are
invoiced manually. The interface never draws an invoice, a credit balance,
savings or a paid status until the ledger is real. **Status:** design.

## Our own bill as proof

We run six live products and we prepare to publish our own AI bill instead of
claiming "we save you X%". The measured figure is published only after operator
approval, with invoice-confirmed and claimed parts kept separate.

No savings percentages, no invented customer counts.
