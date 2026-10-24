---
title: Getting started
slug: getting-started
order: 1
status: live
description: >
  First steps with the Tvijo control plane: connect a provider key, set a
  hard budget, and run your first workflow.
---

# Getting started

The shortest path from sign-in to a controlled AI run is three steps.

## 1. Connect a provider key

Tvijo does not sell model tokens. You bring your own key — this is the **BYOK**
model. Your provider bills you directly; Tvijo adds routing, budgets, guardrails
and an audit trail on top.

See [Connect a provider](connect-a-provider) for the exact steps.

**Status:** live today.

## 2. Set a hard budget

Before any model call can spend, set a budget policy. The platform enforces
daily and monthly caps, plus a per-request limit, and refuses (rather than
silently over-spends) when the cap is reached.

**Status:** live today.

## 3. Run your first workflow

Pick an app or a model from the allowed list and run. Every run records:

- the model that actually executed,
- the provider that served it,
- the real request cost,
- token counts and sanitized routing metadata.

Prompts, responses and secrets are **never** written to the audit trail.

**Status:** live today.

## What you cannot do yet

These are designed but not yet shipped, and are shown as such in the interface:

- autonomous agents that execute actions without approval (**design**);
- managed Linux-server operations (**pilot scope** — see
  [Managed AI Operations](managed-ai-operations));
- semantic search over the knowledge base via embeddings (**design**).
