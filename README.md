# Enterprise Task Management REST API 🚀

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)
![MongoDB](https://img.shields.io/badge/MongoDB-6-green?style=for-the-badge&logo=mongodb)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-Event%20Broker-orange?style=for-the-badge&logo=rabbitmq)
![Redis](https://img.shields.io/badge/Redis-Caching-red?style=for-the-badge&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)

A production-grade, highly scalable Task Management system designed to showcase **Staff-Level Backend Engineering patterns**. Unlike standard MVC applications, this architecture strictly maps distributed enterprise solutions spanning Polyglot Persistence, Message Queues (AMQP), Centralized Cluster Caching, and rigorous Observability constraints.

---

## 🎥 Demo Video

This video demonstrates:

- Task creation and reminder scheduling using BullMQ
- Task categorization and filtering using tags and categories
- Event-driven webhook integration on task completion
- Viewing raw webhook payload

[▶ Watch Demo Video](https://www.youtube.com/watch?v=6KEkjK59h5E&t=4s)

---

## 🛠️ Comprehensive Tech Stack

### Core Runtime
- **Node.js & Express.js**: Asynchronous, non-blocking HTTP processing natively polyfilled with `express-async-errors`.
- **TypeScript**: Strict compilation boundaries ensuring `0` implicit `any` executions across native modules. 

### Data Layer (Polyglot Persistence)
- **PostgreSQL (Sequelize ORM)**: Strictly utilized for Relational **User** structures executing rigid ACID requirements.
- **MongoDB (Mongoose)**: Handles highly agile, unstructured **Task** object mapping optimizing write-intensive payloads.
- **Redis (`ioredis`)**: Facilitates synchronized HTTP cluster constraints globally (Rate limiting, Session rotation matrices).

### Distributed Ecosystem
- **RabbitMQ (`amqplib`)**: Powers the AMQP `Pub/Sub` architecture. When a user drops from Postgres, RabbitMQ fan-out brokers queue the MongoDB workers remotely avoiding asynchronous polling complexities.
- **Docker & Docker Compose**: Unified testing/production boundaries eliminating `it-works-on-my-machine` paradigms. 

### Observability & Tooling
- **Zod**: Blocks runtime crashes explicitly by dynamically typing the Server Runtime `.env` initializations.
- **PM2**: Statically scales the Node instance natively matching absolute bare-metal CPU cores dynamically (`exec_mode: cluster`).
- **Prometheus & Grafana**: Hooks local `/metrics` endpoint data organically executing core server vitals monitoring.
- **K6**: Injects Javascript logic mimicking thousands of HTTP loads asserting `p95` limits sub 500ms natively.

---

## 🏗️ Core Architectural Decisions (The "Why")

### 1. RabbitMQ 
*Solving Polyglot Referential Integrity.* 
We utilize two database engines. If an account is dropped from PostgreSQL, MongoDB cannot execute a standard SQL `ON DELETE CASCADE`. Rather than cron-job polling, the `AuthService` dynamically publishes a `user.deleted` fan-out event. Our decoupled `TaskService` listens gracefully and executes background collection deletions securely.

### 2. Redis-Synchronized Rate Limiting
Caching abuse requests via pure Node "In-Memory" matrices totally fails when scaled behind a Load Balancer (AWS ALB / Nginx / PM2). We execute `rate-limit-redis` storing API strike counts natively within a global Redis store, ensuring DDoS traps hold universally regardless of which Node runtime handles the specific request.

### 3. Graceful Archival 
Standard Soft-Delete architectures (`isDeleted: true`) massively bloat operational querying metrics across extensive NoSQL collections. Executing `TaskService.archiveTask()` intelligently extracts relational pointers onto an independent static `ArchivedTask` model before "Hard-Deleting" the hot document, preserving index reading speeds flawlessly.

### 4. Event-Driven Architecture (BullMQ + Redis)
*Why BullMQ + Redis for asynchronous processing?*
With Redis already serving as an operational cache and rate limiting store, integrating BullMQ dynamically adds persistent, resilient Job Queuing without adding extra infrastructure overhead. This decouples logic like reminder notifications and webhook delivery out of the main HTTP request loop, vastly improving latency and ensuring robustness across failure states.

#### Reminder Scheduling Logic
When tasks receive a `dueDate` dynamically, the system intuitively computes a `dueDate - 1 Hour` offset. A custom job triggers on the `reminderQueue`. Critically, to handle mutability:
- If a user changes the `dueDate`, the system seamlessly locates the old `jobId` from the MongoDB document, nullifies the scheduled trigger securely, and instantiates a distinct job reflecting the updated timeframe.
- Early completions or deletions automatically remove the scheduled job ensuring no phantom reminders fire.

#### Webhook Delivery & Resilience Matrix
Upon a Task marked as "completed", a secondary event fires on the `webhookQueue`. Workers fetch the event structure (`taskId`, `title` etc.) and perform Axios POST sequences out to subscriber hook URLs.
- **Failures & Exponential Backoff:** Network calls natively fail. If the target hook drops, our BullMQ configuration triggers a rigorous retry matrix natively (up to 3 times leveraging `1s, 2s, 4s` backoff progressions). This completely guards against temporary downstream congestion.

### 5. Pure Domain Service Layer
The internal Express logic sits practically vacant. All logic is isolated inside `AuthService` & `TaskService`. This decouples the Node routing engines letting engineers easily port the functional tasks out to Microservices, gRPC routines, or Serverless lambdas dynamically without rewriting internal algorithms.

### 6. Dynamic Categorization & Tagging Strategy
*Why create standalone schemas for Categories and Tags?*
While inserting strings directly onto the `Task` object works for MVP scoping, separating Classification logic onto dedicated NoSQL clusters (`Category.ts`, `Tag.ts`) grants substantial long-term dividends.
- First, it gives absolute CRUD authority mapping `/api/classifications`, meaning clients can dynamically fetch an aggregation of User-owned tags mapped inherently distinct from traversing gigabytes of core Task collections natively.
- Using decoupled Mongoose models permits hard indexes (`userId` + `name`) natively assuring consistency, completely stopping accidental casing collision bugs ('Bug-Fix' vs 'bug-fix') via strict DB layer collision traps.

---


## 📂 Project Structure

```text
├── src/
│   ├── config/           # Database configurations & Zod Env validations
│   ├── controllers/      # Thin HTTP request parsers
│   ├── docs/             # Swagger OpenAPI definition hooks
│   ├── middleware/       # Helmets, Rate Limiters, Bearer Validation
│   ├── models/           # Postgres (Users) & Mongo (Tasks / Archives)
│   ├── routes/           # Express boundary mappings
│   ├── services/         # Deep business logic (RabbitMQ, Task & Auth)
│   ├── utils/            # Prometheus metrics, custom ApiError bounds
│   └── app.ts            # Global Express/Middleware injection
├── tests/
│   ├── integration/      # Supertest/Jest endpoint evaluations
│   └── load/             # K6 Stress injection matrices
├── .github/workflows/    # Enterprise CI/CD Pipeline hooks
├── ecosystem.config.js   # PM2 Cluster map
├── docker-compose.prod.yml # Production Node mapping (6 services)
└── eslint.config.mjs     # Flat-file lint mappings (Prettier)
```

---

## 🔑 Key Features & Security Design

- **Stateful Token Rotation:** Access tokens natively die within `15 minutes`. The `7-day` Refresh Token forces a dynamic re-authentication loop seamlessly stopping token hijacking vulnerabilities natively.
- **Robust Endpoint Ownership Check:** Tasks absolutely map to users via internal comparisons (e.g., `task.userId !== req.user.userId`). Direct payload scraping throws pure `403 Forbidden` limits instantaneously without querying farther.
- **Fault-Tolerant Cache Drop:** The Redis stores are bounded intrinsically. If your centralized Redis drops, the API executes non-blocking fallback mechanisms internally bypassing DDoS traps organically without crashing the core User pipeline. 

---

## ⚡ API Specification 

Interactive `/api-docs` seamlessly spin up on Boot natively mapped dynamically directly utilizing Swagger-JSDoc compilation!

### Example: Compound Filtering
Endpoints inherently accept comprehensive mapping structures:

```http
GET /api/tasks?page=1&limit=10&status=pending&category=Work&tags=Bug,Urgent
Authorization: Bearer <your_access_token>
```
*Expected Response (`formatResponse` uniform format)*
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "metadata": {
    "total": 120,
    "page": 1,
    "limit": 10,
    "results": 10
  },
  "data": [ ... ]
}
```

### Full Classifications API
Along with Task management, the API organically hosts a full CRUD ecosystem under `/api/classifications/` covering custom grouping sets intelligently:
- `POST /api/classifications/categories`
- `GET /api/classifications/categories`
- `POST /api/classifications/tags`
... extending fully outwards! Review `/api-docs` directly for real-world interface querying locally!

---

## 🚀 Execution & Setup

### 1. Zero-Friction Local Spin

Clone, initialize configurations securely, and run local setups smoothly natively out of the box formatting exactly to `.env.example`:

```bash
# Verify modules
npm install

# Force static TypeScript mapping
npm run build 

# Run explicitly
npm start
``` 

### 2. High-Availability Production Cluster (Docker)
Execute the colossal `docker-compose.prod.yml` mapping PostgreSQL, MongoDB, Redis, RabbitMQ, Grafana, and Prometheus alongside the Node container locally:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
*Your entire infrastructure automatically launches executing explicitly inside internal Docker networks seamlessly!*
