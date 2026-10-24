---
title: Managed AI Operations
slug: managed-ai-operations
order: 5
status: pilot
description: >
  Connecting Linux servers to a controlled AI workflow: enrollment, read-only
  audit, human approval and bounded remediation. Early-access pilot.
---

# Managed AI Operations

Tvijo can help you connect a Linux server to a controlled AI workflow — without
giving Tvijo permanent SSH access.

**Status:** pilot scope. This page describes a limited early-access pilot, not a
generally available product.

## What it is

1. You connect a BYOK provider key and set a hard budget.
2. You enroll one server with a short-lived, one-time token.
3. A small **outbound-only** agent performs typed actions locally.
4. Tvijo turns findings into a structured plan and validates it against policy.
5. Reversible and production-affecting actions require a **current human
   approval** tied to the exact plan.
6. The agent returns prechecks, action, post-checks, rollback state and redacted
   evidence.

## First workflow

**Server Health & Safe Remediation** — disk and service health, systemd timers,
listening ports, firewall and backup summaries, and a small reviewed set of
reversible fixes.

## What is not offered in the pilot

- autonomous root access;
- arbitrary shell commands;
- automatic production deployment;
- compliance certification (SOC 2 is not claimed);
- guaranteed savings or uptime.

Security details are pilot contracts, not compliance certification.

## Not built yet

Server enrollment and execution are **design** until the pilot ships. The
workspace **Servers** section, the agent, and the approval flow appear in later
slices. See the product plan for the rollout order.
