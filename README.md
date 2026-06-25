# 🚀 SmartSpend: AI-Powered Wealth Management Platform

Live demo : https://smartspend-phi.vercel.app

**SmartSpend** is a production-grade, full-stack financial orchestration SaaS designed to automate personal budgeting, asset tracking, and smart behavior auditing. Built using a modern Next.js serverless hybrid rendering model, the application shifts the manual overhead of personal ledger tracking away from the user to autonomous background crons and generative AI agents.
It allows users to track their income and expenses, categorize transactions, add descriptions, and set recurring transactions with custom intervals. The application also provides budget alerts and monthly financial insights through email. Additionally, it includes a receipt-scanning feature powered by GenAI, which helped me gain practical experience in integrating AI capabilities into real-world applications.

---

## 🏗️ Technical Architecture & System Infrastructure

The application relies on a completely decoupled, event-driven architecture engineered for absolute mathematical precision, database relational atomicity, and edge security.

| Layer | Technology | Engineering Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | [cite_start]Server Components for instant initial paints alongside Client Server Actions[cite: 39, 40, 149]. |
| **Authentication** | **Clerk Managed Identity** | [cite_start]Secure token handling via a 60-second JWT and HttpOnly refresh cookies[cite: 631, 632]. |
| **Database** | **Supabase Cloud (PostgreSQL)** | [cite_start]Persistent relational engine with strict constraints and ACID guarantees[cite: 72, 560]. |
| **ORM Client** | **Prisma ORM v7** | [cite_start]Database abstraction layer using a custom thread-safe Singleton pattern[cite: 57, 91]. |
| **Asynchronous Queue**| **Inngest Serverless Engine** | [cite_start]Asynchronous task workers with step-based memory caching & retry states[cite: 8, 660, 662]. |
| **Generative AI** | **Google Gemini 2.5 Flash API**| [cite_start]Multi-modal image vision mapping and natural-language dataset analysis[cite: 450, 453]. |
| **Security-as-Code** | **Arcjet Web Defense** | [cite_start]Token-bucket rate limiting, bot protection, and request-payload shielding[cite: 431, 553]. |
| **Notification Engine** | **Resend Mail Service** | [cite_start]Transactional email compilation using native dynamic React configurations[cite: 413, 414]. |

---

## ✨ Core Engineering Features & System Pipelines

### 🤖 1. In-Flight Multi-Modal AI Receipt Scanning (OCR + Classification)
* [cite_start]**Zero-Storage Volatility:** Bypasses slower cloud media buckets entirely[cite: 717, 755]. [cite_start]Ingested images are handled entirely in-flight within a server-side memory stack as an `ArrayBuffer`[cite: 717].
* [cite_start]**Cryptographic Base64 Streaming:** The binary stream is compressed into a Base64 text string and securely forwarded to Gemini 2.5 Flash as an inline data object[cite: 452, 717, 718].
* [cite_start]**Semantic Understanding:** Gemini extracts the merchant name, total balance, and transaction date[cite: 453, 755]. [cite_start]It contextually deduces categories (e.g., mapping "Starbucks" to `Food/Dining`) and feeds back a strict structural JSON payload to pre-fill frontend form boundaries[cite: 453, 709, 755].

### ⏰ 2. Asynchronous Recurring Transactions Engine
* [cite_start]**Ledger Automation:** Every night at midnight (`0 0 * * *`), an Inngest background cron trigger scans the PostgreSQL schema via Prisma[cite: 473, 664, 665, 676].
* [cite_start]**Schedule Rolling:** The worker captures all active templates where the scheduled execution parameters match the current day[cite: 474, 475, 665]. [cite_start]It handles event-throttling to prevent database connection spikes, generating a clean historical ledger row and calculating the next execution timestamp[cite: 473, 479, 488, 492].

### 🚨 3. Proactive Budget Boundary Monitoring
* [cite_start]**Aggregate Computations:** An automated background worker triggers every 6 hours via Inngest to calculate current month-to-date transaction sums (`startOfMonth` to `endOfMonth`) against user boundaries[cite: 356, 357, 358, 393].
* [cite_start]**Anti-Spam State Locks:** If spending crosses **80%** or **100%** of limits, a state validation guard checks for historical flags: `(!budget.lastAlertSent || isNewMonth())`[cite: 399]. [cite_start]This updates a persistent database lock timestamp column, preventing repetitive message flooding[cite: 401, 402].

### 📁 4. Monthly AI Financial Audits & In-Memory PDF Factories
* [cite_start]**Horizontal Fan-Out workers:** On the first day of every month, Inngest wakes up a core pipeline that maps active user metadata and initializes an isolated, highly concurrent sub-task fan-out loop across thousands of independent cloud workers[cite: 512, 673, 674, 675].
* [cite_start]**Native Server Compilation:** Each worker bundles the user's monthly ledger trends and requests natural-language behavioral advice from Gemini[cite: 513, 712, 713]. [cite_start]The text is then injected into a server-rendered `pdfkit` instance isolated via `serverExternalPackages` inside `nextConfig`[cite: 529, 535, 539]. [cite_start]The statement is compiled entirely in-memory as a binary data buffer and instantly emailed via Resend as a downloadable statement attachment[cite: 531, 534, 538].

### ⚖️ 5. Atomic Ledger Balance Rollbacks (Bulk Deletion Architecture)
* [cite_start]**The Race Condition Threat:** Deleting multiple transactions simultaneously risks data corruption or fragmented ledger balances if a network dropped middle-execution[cite: 752, 753].
* [cite_start]**Transactional Integrity:** The backend action reduces target records to calculate precise account balance counterweights[cite: 273]. [cite_start]The entire pipeline is wrapped in an isolated database transaction block: `await db.$transaction(async (tx) => { ... })`[cite: 274]. [cite_start]If any single row fails, the database throws an explicit exception and rolls back the execution state entirely[cite: 486, 753].

### 🛡️ 6. Security-as-Code Shielding Middleware
* [cite_start]**Request Interception:** Running natively inside edge middleware, Arcjet checks headers and client footprints in single-digit milliseconds[cite: 554, 680, 687].
* [cite_start]**Abuse Prevention:** Implements tight Token-Bucket algorithms mapped to Clerk user tracking to neutralize endpoint request flooding while actively logging and dropping malicious web scraping tools[cite: 431, 438, 553, 688].

---

## 📁 Project Directory Mapping

```text
smartspend/
├── src/
│   ├── app/                    # Next.js App Router Core Layouts & Routing
│   │   ├── (auth)/             # Route group isolating Clerk authentication views
│   │   ├── (main)/             # Protected workspace views (dashboard, dynamic account tables)
│   │   └── api/inngest/        # Cloud background queue webhook communication router
│   ├── actions/                # React Server Actions (Stateless atomic backend database operations)
│   ├── components/             # Accessible, reusable component primitives (shadcn/ui + Tailwind)
│   ├── hooks/                  # Custom hooks (use-fetch custom async state controller)
│   ├── lib/                    # Infrastructure Core Configuration Initializers
│   │   ├── prisma.js           # Shared Database Single-Pooler connection wrapper
│   │   └── arcjet.js           # Edge firewall security rules registry
│   └── emails/                 # Dynamic transactional layouts compiled via React Email
├── prisma.config.ts            # Brain configuration controller for Prisma CLI operations
└── schema.prisma               # Strongly-typed relational integrity model mapping for PostgreSQL
