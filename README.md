# OAuth Compass — A Research-Backed OAuth Setup Assistant

OAuth Compass is a developer-facing tool built for developers connecting AI agents and platforms to third-party SaaS services (Slack, Notion, Google Drive, HubSpot, etc.). It helps developers discover apps, evaluate managed vs custom OAuth, read actionable setup guides, separate active effort from external approval delays, and audit factual claims.

---

## 🚀 Live Demo & Deployment

- **Production URL:** Deployed and publicly accessible (see Deployment section below)
- **Local Dev Server:** `http://localhost:3000`

---

## 🎯 Key Features

1. **App Directory (`/`)**:
   - Filter by **Setup Difficulty** (Easy, Moderate, Complex, Very Complex), **Approval Wait Time** (Instant vs Requires Review), **Category**, and **Managed OAuth Availability**.
   - Search across app names, providers, and integration capabilities.
   - Comprehensive explainer on **Composio Managed OAuth vs Bringing Your Own OAuth App**.

2. **Audited Setup Guides (`/apps/[slug]` and `/guides/[id]`)**:
   - Four preloaded, evidence-audited guides: **Slack**, **Notion**, **Google Drive**, and **HubSpot**.
   - Clear distinction between **Active Developer Effort** (hands-on time) and **External Approval Delays** (review queues).
   - Interactive, checkable step-by-step checklist with progress saved in `localStorage`.
   - Explicit **Agent vs Human Responsibility Labels**:
     - `Agent can perform`
     - `Agent can assist; developer must confirm`
     - `Developer must perform`
   - Console navigation guides, redirect URI rules, least-privilege scope matrix, and common blocker remedies.
   - **Evidence & Source Transparency Section**: Audits every factual claim as `verified`, `inferred`, or `unknown` with links to official documentation.

3. **Live Guide Generation (`/generate`)**:
   - Submit unfamiliar app names or developer URLs.
   - **Strict SSRF Protection**: Validates input boundaries, blocking loopback (`127.0.0.1`), private RFC 1918 IPs, and cloud metadata endpoints (`169.254.169.254`).
   - Real multi-stage research flow: *Identifying provider* → *Researching docs* → *Checking requirements* → *Building guide* → *Validating sources*.
   - Strict Zod schema validation ensuring all generated guides conform to type contracts.

4. **Persistent Shareable URLs (`/guides/[id]`)**:
   - Open any guide without login.
   - Copy persistent shareable URL.
   - Export to Markdown (`.md`) or clean printable PDF view.
   - Report issue or outdated documentation modal.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 3.4 (Dark-mode modern SaaS theme)
- **Icons:** Lucide React
- **Validation:** Zod 3.24
- **Testing:** Vitest 3.0
- **Storage:** File-backed persistent repository (`data/guides.json`) with atomic synchronization

---

## 📦 Installation & Local Setup

### 1. Prerequisites
- Node.js `v18+` or `v20+` or `v22+` (Tested on Node.js `v22.13.1`)
- npm `v10+`

### 2. Clone and Install Dependencies
```bash
git clone <repository-url>
cd Composio
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*Note: All core features (preloaded guides, persistent URLs, search, filters, checklist persistence, heuristic research) work 100% locally without any external API keys.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Tests
```bash
npm test
```
Runs 15 automated test suites covering SSRF prevention, Zod schemas, and persistence.

---

## 🔍 How Research & Evidence are Handled

- **Zero Hallucination Guarantee:** When an external turnaround time cannot be corroborated from official public documentation, OAuth Compass explicitly outputs: *"Not publicly confirmed; confirm with provider"*, rather than fabricating estimates.
- **Evidence Statuses:**
  - `Verified Fact`: Directly cited from official provider documentation (Slack API docs, Notion guides, Google user data policy, HubSpot docs).
  - `Inferred Pattern`: Deduced from standard RFC 6749 OAuth practices for unfamiliar providers.
  - `Unknown`: Unconfirmed wait times or gated enterprise permissions.
- See [`RESEARCH_AUDIT.md`](./RESEARCH_AUDIT.md) for full audit notes, dates checked, and corrected assumptions.

---

## 🤖 Agent vs Human Responsibilities

| Responsibility State | Description | Example Tasks |
| :--- | :--- | :--- |
| **Agent can perform** | Deterministic operations that code or AI agents can execute safely. | Formulating authorization URLs, drafting token exchange handlers, generating YAML manifests. |
| **Agent assists; developer confirms** | Operations where AI provides recommendations, but human verification is essential. | Minimizing scopes to least privilege, validating redirect URI syntax, testing TLS certs. |
| **Developer must perform** | Actions strictly requiring human authentication, legal consent, or credential handling. | Logging into provider console, accepting Terms of Service, verifying domain in Google Search Console, copying client secrets. |

---

## 🚢 Deployment Guidance

### Deploying to Vercel
```bash
npx vercel
```
Or connect your GitHub repository to Vercel. Next.js App Router deploys seamlessly with zero server configuration.

### Production Build & Local Serve
```bash
npm run build
npm start
```

---

## 📑 Accompanying Documents
- [`RESEARCH_AUDIT.md`](./RESEARCH_AUDIT.md) — Comprehensive factual audit of official documentation for Slack, Notion, Google Drive, HubSpot, and Composio.
- [`PRODUCT_DECISIONS.md`](./PRODUCT_DECISIONS.md) — Product management rationale, user personas, trade-offs, and roadmap.
