# Node.js REST API Architecture

A production-grade, highly scalable Task Management REST API showcasing strict backend engineering patterns.

## 🏗️ Core Architecture Decisions

### 1. Why a Service Layer Pattern?
In simple MVC architectures, "Fat Controllers" are a prominent anti-pattern. If you dump logic directly inside Express controllers, testing that logic requires spinning up an entire mocked HTTP server just to pass `(req, res)`.
By isolating our business context into `AuthService` and `TaskService`, Express controllers simply map incoming HTTP requests to abstract TS functions. This separation of concerns allows the underlying systems to be swapped (e.g., executing services natively from a gRPC hook or Cron Job) without touching HTTP contexts. 

### 2. Why RabbitMQ? (Microservice Polyglot Integrity)
This stack uses PostgreSQL (for Users) to enforce relational integrity and MongoDB (for Tasks) to handle highly active JSON objects natively.
**The Problem**: Polyglot databases cannot establish explicit Foreign Keys (`ON DELETE CASCADE`). If a User is removed from PostgreSQL, MongoDB will unknowingly retain millions of tasks assigned to that ghost user, permanently bloating hot collections. 
**The Solution**: RabbitMQ. When PostgreSQL drops a user, `AuthService` natively publishes a `user.deleted` fan-out event. Our decoupled `TaskService` consumers listen to this distributed AMQP queue natively and execute cleanup logic autonomously. 

### 3. Why Redis?
Using `express-rate-limit` locally relies on Native Node memory to track DDoS attempts. If you scale this app behind a Load Balancer (spinning up 4 distinct Node instances via PM2/Docker), each IP hits a different server randomly. Attackers inherently bypass rate limits simply because the internal nodes don't share identical state tracking. 
**The Solution**: `rate-limit-redis`. Pushing rate thresholds to a highly available external cache correctly preserves synchronized traffic rules universally across your entire computing cluster.

---

## 🛡️ Fallback & Resilience Behaviours

Production systems are designed assuming internal dependencies will crash. This infrastructure utilizes "Fail Gracefully" concepts:

- **What if Redis fails?**
  Our `ioredis` driver inherently wraps execution hooks in non-blocking event streams. If Redis disconnects, it logs the failure asynchronously while entering reconnection loops. Express-rate-limit will not fatally crash the `req/res` cycle, allowing valid requests to flow while bypassing cache until quorum is organically restored.
- **What if RabbitMQ goes down?**
  Event payloads dispatched to `rabbitmq.service.ts` are gated via implicit `channel` null-checks. If RabbitMQ dies natively, the Node.js service catches the connection fault natively. Instead of hard-crashing and returning an HTTP 500 out to the frontend, operations gracefully yield a standard console.error tracking log, and the HTTP `200` response continues organically mapping business interactions without interrupting User flow.

---

## ⚡ Key Features & API Execution

### Outstanding Authorization & Scaling
- **Access & Refresh Tokens**: Employs short-lived (15-min) static JWT sequences alongside Stateful Refresh Tokens to completely mitigate static session theft architectures. 
- **Ownership Verification**: Every core payload natively evaluates `if (task.userId !== req.user.userId)` implicitly returning a `403 Forbidden`. You cannot manipulate alternative tenant systems. 
- **Soft-Delete Archive Engine**: Standard implementation of `isDeleted` clogs hot B-Tree MongoDB metrics. Executing `DELETE /tasks/:id` organically transfers states into a partitioned `ArchivedTask` static collection mitigating read-latency drops dynamically.

### Visible Filtering Implementation
All queries implicitly utilize powerful URL sorting. Test it natively here:
```http
GET /api/tasks?page=1&limit=10&status=pending
Authorization: Bearer <your_jwt>
```
*Expected Response:*
```json
{
  "success": true,
  "message": "Tasks retrieved successfully",
  "metadata": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "results": 10
  },
  "data": [ ... ]
}
```

---

## 🚀 Setup Validation

### Prerequisites
1. Installed Node.js (v20) and NPM.
2. Hosted instances (or Docker compose mappings) for PostgreSQL, MongoDB, Redis, and RabbitMQ. 

### Start Workflow

1. Configure environment mappings utilizing Zod compilation via `.env`.
2. Install strict environment architectures:
```bash
npm install
```
3. Evaluate static code configurations:
```bash
npx tsc --noEmit
npx eslint src/**/*.ts
```
4. Start development processes smoothly mapping Swagger APIs (`localhost:5000/api-docs`):
```bash
npm start
```
