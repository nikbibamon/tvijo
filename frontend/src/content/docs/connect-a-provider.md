---
title: Connect a provider
slug: connect-a-provider
order: 2
status: live
description: >
  How to add and verify a BYOK provider key (OpenRouter and others), and which
  privacy routing defaults Tvijo applies on every request.
---

# Connect a provider (BYOK)

Tvijo never silently pays for your calls with a platform key. You connect your
own provider key; Tvijo routes, limits, guards and audits on top of it.

**Status:** live today.

## Supported providers

- OpenRouter
- Anthropic
- OpenAI
- DeepSeek
- Groq
- RunPod

OpenRouter and the direct providers are verified differently — OpenRouter uses a
live, non-generation key check, others use legacy verification. The interface
states which check was used.

## Steps

1. Open **Workspace → Connections**.
2. Choose the provider and paste your key.
3. Set a label (for example `prod`) and an environment (`production`,
   `development`, `staging`).
4. Click **Verify**. Verification never spends model tokens.

The key is encrypted at rest and is **never** returned by the API. A key that
fails verification moves to `error` and cannot be used for runs.

## Privacy routing defaults (OpenRouter)

Every OpenRouter request is sent with these defaults:

- `require_parameters=true` — the provider must accept all request parameters;
- `data_collection=deny` — the provider must not collect data;
- `zdr=true` — zero data retention where the route supports it;
- `allow_fallbacks=true` — bounded provider fallback is allowed.

A model with no zero-data-retention route is unavailable while `zdr=true`.
See [Models](models).

## Verified key priority

A verified user key takes precedence over any server fallback key. Revoking the
credential immediately removes it from routing — the router never selects a
revoked or errored credential.
