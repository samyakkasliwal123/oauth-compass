# OAuth Compass — Product Decisions Document

**Role:** Associate Product Manager (Developer-Focused SaaS Take-Home Assessment)  
**Date:** October 28, 2026  
**Product:** OAuth Compass (A Research-Backed OAuth Setup Assistant)

---

## 1. Executive Summary & Problem Framing

Developers building autonomous AI agents frequently need to connect to third-party SaaS services (Slack, Notion, Google Drive, HubSpot) so their agents can read messages, search files, query CRM pipelines, or write summaries. 

However, registering a custom OAuth 2.0 application with these providers is filled with hidden friction:
1. **Unclear Architecture Decisions:** Developers do not know whether they actually need a custom developer-console application or if they can leverage a managed OAuth provider (like Composio Managed Auth).
2. **Conflated Time Horizons:** Providers either hide or obfuscate approval delays. A developer might finish code in 20 minutes only to find out Google Drive requires a 6-week third-party CASA audit costing $15,000 for restricted scopes.
3. **Ambiguous Agent vs Human Boundaries:** Many tools unrealistically promise that AI agents can "do everything", whereas legal terms acceptance, domain verification in Search Console, and secret retrieval strictly require human intervention.
4. **Outdated Documentation & Link Rot:** Developer documentation moves frequently (e.g. HubSpot restructuring its developer portal), leading to broken URLs and invalid instructions.

**OAuth Compass** solves this by providing a developer-first dashboard that audits provider requirements, evaluates managed auth feasibility, separates active effort from external queues, and delivers actionable, evidence-backed checklists.

---

## 2. Target Personas

| Persona | Primary Goal | Critical Pain Point | How OAuth Compass Solves It |
| :--- | :--- | :--- | :--- |
| **AI Agent Engineer** | Connect an LLM agent to external tools with minimal friction. | Scope confusion (e.g. SIWS conflicts in Slack, page-picker drops in Notion). | Curated, least-privilege scope taxonomy and automated blocker remedies. |
| **Founding Full-Stack Dev** | Ship MVP integrations fast to close enterprise pilot deals. | Unclear turnaround time for app approval and domain verification. | Transparent effort vs approval wait-time model (Same-day vs Multi-week). |
| **Infosec / Compliance Lead** | Ensure third-party access follows the principle of least privilege. | Over-privileged scopes triggering security audits and data liability. | Explicit warning against restricted scopes (e.g. `drive.file` vs `drive`). |

---

## 3. Product Principles

1. **Evidence Grounding Over AI Hallucination:** Never invent a turnaround time or claim to have verified an official source when that did not happen. If an approval time is unconfirmed, mark it explicitly as *"Not publicly confirmed; confirm with provider"*.
2. **Distinct Time Concepts:** Active hands-on developer effort (15–30 min) must never be conflated with external bureaucratic review queues (1–3 weeks).
3. **Pragmatic Automation (Honest Agent Boundaries):** Categorize every step into one of three explicit states:
   - `Agent can perform` (e.g., draft code, generate URL, validate schema)
   - `Agent can assist; developer must confirm` (e.g., recommend scopes, test TLS)
   - `Developer must perform` (e.g., accept legal terms, create console credentials, Search Console verification)
4. **Security by Default (SSRF Guarding):** User-supplied URLs for unfamiliar apps are strictly sanitized at the input boundary, blocking loopback, RFC 1918 private IPs, and cloud metadata endpoints (`169.254.169.254`).

---

## 4. Architecture & Technical Trade-Offs

| Decision | Selected Option | Considered Alternative | Trade-Off & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, Tailwind CSS) | Single Page React App (Vite) | App Router provides server-side rendering for persistent SEO-friendly shareable URLs (`/guides/[id]`) and clean API route co-location. |
| **Persistence Layer** | Persistent File-Backed Repository (`data/guides.json`) | Remote PostgreSQL / Supabase | A file-backed repository with atomic writes requires zero paid external database keys, works reliably in any hosting environment, and ensures shareable links (`/guides/[id]`) survive server reboots without external downtime. |
| **Research Engine** | Hybrid: Heuristic Knowledge + Safe Public Retrieval + LLM Fallback | Pure LLM Prompting | Pure LLM prompting hallucinates URLs and turnaround times. The hybrid model grounds facts in retrieved official documentation and applies explicit verification status badges. |
| **State Persistence** | LocalStorage with User Notice | User Auth / Accounts | Adding user accounts introduces unnecessary signup barriers. Storing checklist progress in localStorage gives instant utility while keeping the tool completely friction-free. |

---

## 5. Effort and Wait-Time Model

To help product teams plan release cycles accurately, OAuth Compass models time in three dimensions:
```
Total Elapsed Time = Active Developer Effort + External Approval Delay + Rework Buffer
```
* **Active Effort:** Hands-on time spent in consoles and editors (e.g. 15–30 mins for Slack, 20–35 mins for HubSpot).
* **External Waiting Time:** 
  - **Instant (0 days):** Private app installations, direct install links with workspace admin consent (Slack internal, Notion public link, HubSpot direct install).
  - **Testing Mode (0 days):** Up to 100 registered test accounts in Google Cloud Console.
  - **Sensitive Scope Verification (3–7 business days):** Google verification for `drive.file`.
  - **Restricted Scope Verification (4–8 weeks):** Third-party CASA Tier 2/Tier 3 lab assessment for full Google Drive access ($1,500–$15,000 fee).
  - **Public Marketplace Listing (1–3 weeks):** Slack App Directory or HubSpot App Marketplace.

---

## 6. Known Limitations

1. **Provider Console UI Updates:** Major SaaS providers periodically redesign their developer settings dashboards; screenshot references may differ slightly from live portals over time.
2. **Third-Party Lab Pricing:** CASA lab fees fluctuate between security vendors and are estimated from industry averages.
3. **Rate Limits & Tier Gating:** Certain providers (e.g., HubSpot Custom Objects) gate OAuth scopes behind enterprise tiers, which cannot be programmatically detected without customer portal access.

---

## 7. Roadmap: Next 3 High-Impact Priorities

1. **Automated Console CLI Generator (`agy oauth init`):** Provide a single CLI command that scaffolds local callback routes, generates `.env` files with redirect URI templates, and runs pre-flight TLS validation.
2. **Composio 1-Click Hosted Connect Embed:** Allow developers to immediately test the connection using a live Composio Connect Link directly inside OAuth Compass.
3. **Live Webhook & Event Subscription Guide:** Expand beyond authorization to detail event subscription setup (e.g., Slack Event API request verification and Notion webhook triggers).
