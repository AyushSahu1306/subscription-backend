# Backend Subscriptions & Payments System

> **Note**: This project was built as a learning-focused, production-oriented backend. The goal was correctness, safety under concurrency, and clean separation of concerns — not speed or feature bloat.

---

## Overview
This project implements a backend system that supports:
- Session-based authentication
- Subscription lifecycle management
- Time-aware access control
- Idempotent payment webhook processing

The system is designed to behave correctly under retries, concurrent requests, and delayed background jobs — scenarios commonly encountered in real production systems.

---

## Tech Stack
- **Node.js + Express** (TypeScript, ESM)
- **PostgreSQL** (with constraints and transactions)
- **pg** (node-postgres)
- **JWT** (access tokens)
- **bcrypt** (hashing refresh tokens)

---

## Key Features

### Authentication
- Session-based authentication using short-lived access tokens and long-lived refresh tokens
- Refresh token rotation to prevent replay attacks
- Support for multiple sessions per user
- Logout (single session) and logout-all (all sessions)

### Subscriptions
- Subscription lifecycle with explicit states: `trialing`, `active`, `past_due`, `canceled`, `expired`
- One active-like subscription per user enforced at the database level
- Time-aware access control based on subscription status and timestamps
- Separation between access checks (read-only) and state cleanup (background jobs)

### Payments
- Append-only payment records
- Idempotent webhook handling using provider event IDs
- Transactional webhook processing
- State-aware subscription transitions based on payment outcomes
- Webhook signature verification using raw request bodies

---

## How to Run (Development)
1. Set up PostgreSQL and run migrations
2. Configure environment variables
3. Start server using nodemon

