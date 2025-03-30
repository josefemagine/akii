# Product Requirements Document (PRD)

## Principle

When fixing problems, always fix the root cause and never take shortcuts.

## Project Name: Akii

## Goal

To build a powerful, user-friendly SaaS platform that empowers businesses—especially SMBs—to set up and manage their own private AI. Akii gives every company its own customizable, secure, and trainable AI that can power sales, support, analytics, and more. Businesses can train their AI with internal data (sales manuals, support docs, chat transcripts, product catalogs, APIs) and integrate it across their tools and platforms. Akii combines plug-and-play AI agents with powerful developer APIs, robust compliance, and enterprise-grade security to bring AI ownership to businesses of all sizes.

## Positioning

Akii – Your Company’s Own AI  

Train it. Own it. Build on top of it.  

Sales, support, operations, compliance, HR, analytics – powered by your own AI. Secure, scalable, private and easy to use.

---

## SECTION 1: Marketing Website

### Deliverables

- Landing page with dynamic content

- SEO-optimized setup (meta tags, OG tags, sitemap, robots.txt)

- Feature subpages:

  - Web Chat Agent

  - Mobile Chat Agent

  - WhatsApp Chat Agent

  - Telegram Chat Agent

  - Shopify Chat Agent

  - WordPress Chat Agent

  - Private AI API (New)

- Blog CMS integration

- Terms of Service & Privacy Policy

- AI Landing Page Generator with A/B testing, dynamic rendering

- Lead Magnet Campaigns with popup/OTP/email flow and gated content delivery

---

## SECTION 2: User Dashboard

### Authentication System

- Supabase Auth

- Email/password + Google login

- Role-based routes

### AI Agent Builder

- Agent creation and training

- Document upload (manual + via Zapier)

- Multilingual, memory, and voice support

- Cross-platform deployment options (web, mobile, chat apps)

### AI API Platform (NEW)

- Deploy private AI instance per client

- All apps/tools route through the client’s private API

- Use cases include:

  - Analytics dashboards

  - Internal training AI

  - Voice-guided customer bots

  - In-app AI assistants

- Support API data streams and role-based access

- Model selection (shared or dedicated)

### Conversation Management

- History search and filters

- Feedback loop

### Analytics & Optimization

- Conversion tracking

- Agent performance metrics

- AI improvement suggestions

### Developer Tools

- API key system

- Public playground

- Webhooks

- Built-in n8n integration (visual workflow builder)

  - Prebuilt triggers and actions

  - Form/input listeners

  - Workflow automation with Akii-powered logic

### Team & Collaboration

- Multi-user teams

- Template marketplace

### Subscription & Billing

- Free trial flow

- Tier-based pricing

- Pay-per-message caps

- Upgrade/downgrade system

---

## SECTION 3: Admin Dashboard

### System Analytics

- Global metrics (usage, revenue, sessions)

- Stripe integration

- AI provider performance

### User & Agent Management

- CRUD access for users and clients

- Assign tiers and models

### Product & Model Management

- Setup packages and pricing

- Link AI providers to specific packages

- Configure shared vs private model access

### Document Training System

- Upload, chunk, tag, and embed content

- PII redaction

- Zapier & webhook ingestion

### Compliance Tools

- GDPR, CCPA, HIPAA-ready config

- Consent, rights, and audit logs

### Moderation System

- Dual AI moderation

- Human review with logs and simulation

### Communication Tools

- Email template builder

- Newsletter engine

- Unsubscribe management

### Blog & Content Automation

- Manual and AI-generated content workflows

- Full SEO fields and tagging

### Affiliate Management

- Track and pay affiliate commissions

- Campaign reporting

### n8n Workflow Manager

- Assign, track, and debug workflows

- Safety controls for rate limits and edge cases

---

## Technology Stack

- Frontend: React (TS), Vite, Tailwind, ShadCN UI

- Backend: Supabase (Auth, DB, Storage, Edge)

- Email: Resend

- Payments: Stripe

- AI: Modular integration (multi-provider), BYOM support

- Hosting: Vercel

## Dev Standards

- Fully responsive UI

- Dark mode with Light mode switch

- React Router + dynamic routes

- Zod + React Hook Form for validation

## Edge Functions

- Document ingestion & vectorization

- Moderation triggers

- Webhook support

## TypeScript Conventions

- Use nullish coalescing for optionals

- Ensure type safety on .insert()

- No unsafe casting

- Sanitize .settings and .metadata

- Remove deprecated DB fields

- Avoid unsupported SQL operations

