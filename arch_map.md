# Architecture

```mermaid
%%{init: {'theme':'default'}}%%
graph LR
    subgraph Documenso_App_Container["Documenso App Container (docker, node)"]
        subgraph Web_Application["Web Application (typescript, react-router, hono)"]
            Web_Application_Hono_Server[/"Hono Server"\]
            Web_Application_React_Router_UI[/"React Router UI"\]
        end
        subgraph REST_API_V1["REST API V1 (typescript, ts-rest)"]
            REST_API_V1_Contract_Definitions["Contract Definitions"]
            REST_API_V1_REST_Handlers["REST Handlers"]
        end
        subgraph tRPC_API["tRPC API (typescript, trpc, openapi)"]
            tRPC_API_Document_Router["Document Router"]
            tRPC_API_Template_Router["Template Router"]
            tRPC_API_Envelope_Router["Envelope Router"]
            tRPC_API_Organisation_Router["Organisation Router"]
            tRPC_API_Recipient___Field_Routers["Recipient & Field Routers"]
        end
        subgraph Business_Logic_Core["Business Logic Core (typescript)"]
            Business_Logic_Core_Server_Business_Logic(["Server Business Logic"])
            Business_Logic_Core_Universal_Helpers(["Universal Helpers"])
            Business_Logic_Core_Background_Jobs(["Background Jobs"])
            Business_Logic_Core_Client_Utilities(["Client Utilities"])
        end
        Authentication(["Authentication (typescript, arctic, webauthn)"])
        PDF_Signing(["PDF Signing (typescript)"])
        Email_Templates(["Email Templates (typescript, react-email, nodemailer)"])
    end
    Documentation_Site[/"Documentation Site (typescript, nextjs, fumadocs)"\]
    OpenPage_API["OpenPage API (typescript, nextjs)"]
    Database(["Database (typescript, prisma, kysely)"])
    Notifications(["Notifications (typescript)"])
    SMS(["SMS (typescript)"])
    UI_Components(["UI Components (typescript, react, tailwind, radix)"])
    Enterprise_Edition(["Enterprise Edition (typescript)"])
    Static_Assets(["Static Assets (typescript)"])
    E2E_Tests(["E2E Tests (typescript, playwright)"])

    PostgreSQL[("PostgreSQL")]
    Redis[("Redis")]
    S3_Storage[("S3 Storage")]
    Inngest[/"Inngest"/]
    Google_Cloud_KMS[["Google Cloud KMS"]]
    Stripe[["Stripe"]]
    SMTP_Provider[["SMTP Provider"]]
    Resend[["Resend"]]
    MailChannels[["MailChannels"]]
    Google_OAuth[["Google OAuth"]]
    PostHog[["PostHog"]]

    Web_Application --> REST_API_V1
    Web_Application --> tRPC_API
    Web_Application --> Business_Logic_Core
    Web_Application --> Authentication
    Web_Application --> UI_Components
    Web_Application --> Email_Templates
    OpenPage_API --> Database
    REST_API_V1 --> Business_Logic_Core
    REST_API_V1 --> Database
    tRPC_API --> Business_Logic_Core
    tRPC_API --> Database
    tRPC_API --> Authentication
    Business_Logic_Core --> Database
    Business_Logic_Core --> PDF_Signing
    Business_Logic_Core --> Email_Templates
    Business_Logic_Core --> S3_Storage
    Business_Logic_Core --> Inngest
    Business_Logic_Core --> Redis
    Business_Logic_Core --> Stripe
    Business_Logic_Core --> PostHog
    Business_Logic_Core --> Google_OAuth
    Database --> PostgreSQL
    Authentication --> Database
    Authentication --> Google_OAuth
    PDF_Signing --> Google_Cloud_KMS
    Email_Templates --> SMTP_Provider
    Email_Templates --> Resend
    Email_Templates --> MailChannels
    Enterprise_Edition --> Business_Logic_Core
```

---

### Web Application `typescript, react-router, hono`

Main end-user web app combining the React Router UI and Hono server that mounts all API routes and serves the signing experience.

**Path:** `apps/remix`

**Depends on:** REST API V1, tRPC API, Business Logic Core, Authentication, UI Components, Email Templates, Background Jobs

- **Hono Server** — Node entrypoint that mounts REST v1, tRPC v2, internal tRPC, and jobs handlers under a single HTTP server.
- **React Router UI** — File-based routes split into authenticated, unauthenticated, and recipient signing flows.

### Documentation Site `typescript, nextjs, fumadocs`

Public documentation website for Documenso users and integrators.

**Path:** `apps/docs`


### OpenPage API `typescript, nextjs`

Public analytics API exposing aggregated product metrics.

**Path:** `apps/openpage-api`

**Depends on:** Database


### REST API V1 `typescript, ts-rest`

Deprecated contract-based REST API for documents, templates, recipients, and fields, mounted at /api/v1.

**Path:** `packages/api`

**Depends on:** Business Logic Core, Database

- **Contract Definitions** — ts-rest route contracts describing request and response schemas.
- **REST Handlers** — Request handlers that validate auth tokens and delegate to core business logic.

### tRPC API `typescript, trpc, openapi`

Current tRPC-based API layer powering both the internal UI API and the public V2 OpenAPI surface.

**Path:** `packages/trpc`

**Depends on:** Business Logic Core, Database, Authentication

- **Document Router** — tRPC procedures for document CRUD, sending, and signing lifecycle.
- **Template Router** — tRPC procedures for template management and bulk sending.
- **Envelope Router** — tRPC procedures for multi-document envelope operations.
- **Organisation Router** — tRPC procedures for organisations, teams, members, and billing integration.
- **Recipient & Field Routers** — tRPC procedures for managing signers and their assigned fields on documents.

### Business Logic Core `typescript`

Central library containing server-only business logic, client utilities, universal helpers, and background job definitions.

**Path:** `packages/lib`

**Depends on:** Database, PDF Signing, Email Templates, S3 Storage, Inngest, Redis, Stripe, PostHog, Google OAuth

- **Server Business Logic** — Server-only domain operations for documents, signing, teams, billing, and webhooks.
- **Universal Helpers** — Shared utilities including storage upload abstraction used on both client and server.
- **Background Jobs** — Job provider implementations (Inngest, BullMQ, local) plus job handler definitions.
- **Client Utilities** — Browser-safe helpers consumed by the Remix UI.

### Database `typescript, prisma, kysely`

Prisma schema, migrations, and generated client with a Kysely extension for typed raw queries.

**Path:** `packages/prisma`

**Depends on:** PostgreSQL


### Authentication `typescript, arctic, webauthn`

Authentication module handling OAuth providers, passkey/WebAuthn, sessions, and API token verification.

**Path:** `packages/auth`

**Depends on:** Database, Google OAuth


### PDF Signing `typescript`

Cryptographic PDF signing abstraction supporting local P12 certificates and Google Cloud KMS.

**Path:** `packages/signing`

**Depends on:** Google Cloud KMS


### Email Templates `typescript, react-email, nodemailer`

Transactional email templates and mailer abstraction supporting SMTP, Resend, and MailChannels.

**Path:** `packages/email`

**Depends on:** SMTP Provider, Resend, MailChannels


### Notifications `typescript`

User notification dispatching shared across UI and background jobs.

**Path:** `packages/notifications`


### SMS `typescript`

SMS sending abstraction for signer verification and notifications.

**Path:** `packages/sms`


### UI Components `typescript, react, tailwind, radix`

Shared React component library built on Shadcn, Radix, and Tailwind.

**Path:** `packages/ui`


### Enterprise Edition `typescript`

Enterprise-only features such as advanced auth, audit logs, and compliance extensions.

**Path:** `packages/ee`

**Depends on:** Business Logic Core


### Static Assets `typescript`

Shared static images, icons, and logos used across apps.

**Path:** `packages/assets`


### E2E Tests `typescript, playwright`

Playwright end-to-end tests covering signing, auth, and document flows.

**Path:** `packages/app-tests`


---

## Deployment

```mermaid
%%{init: {'theme':'default'}}%%
graph TB
    subgraph Documenso_App_Container["Documenso App Container (docker, node)"]
        Documenso_App_Container_Web_Application["Web Application"]
        Documenso_App_Container_REST_API_V1["REST API V1"]
        Documenso_App_Container_tRPC_API["tRPC API"]
        Documenso_App_Container_Business_Logic_Core["Business Logic Core"]
        Documenso_App_Container_Authentication["Authentication"]
        Documenso_App_Container_PDF_Signing["PDF Signing"]
        Documenso_App_Container_Email_Templates["Email Templates"]
    end
    subgraph PostgreSQL_Container["PostgreSQL Container (docker, postgres)"]
        PostgreSQL_Container_PostgreSQL["PostgreSQL"]
    end
    subgraph Render_Web_Service["Render Web Service (render, node)"]
        Render_Web_Service_Web_Application["Web Application"]
    end
    subgraph Render_Managed_Database["Render Managed Database (render, postgres)"]
        Render_Managed_Database_PostgreSQL["PostgreSQL"]
    end
    subgraph Railway_Service["Railway Service (railway, docker)"]
        Railway_Service_Web_Application["Web Application"]
    end

    Documenso_App_Container --> PostgreSQL_Container
```

**Documenso App Container** `docker, node`
: Single production container image (documenso/documenso) serving the Remix app and all mounted APIs.
  Hosts: Web Application, REST API V1, tRPC API, Business Logic Core, Authentication, PDF Signing, Email Templates
  Depends on: PostgreSQL Container

**PostgreSQL Container** `docker, postgres`
: PostgreSQL 15 container providing the primary application database.
  Hosts: PostgreSQL

**Render Web Service** `render, node`
: Render.com managed web service deployment target defined in render.yaml.
  Hosts: Web Application

**Render Managed Database** `render, postgres`
: Render.com managed PostgreSQL instance (documenso-db) bound to the web service.
  Hosts: PostgreSQL

**Railway Service** `railway, docker`
: Railway deployment target building from docker/Dockerfile.
  Hosts: Web Application
