# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

Each service is built and run independently using Maven wrapper:

```bash
# Build a service (run from service directory)
cd <service-name> && ./mvnw clean package -DskipTests

# Run a service locally
cd <service-name> && ./mvnw spring-boot:run

# Run tests for a service
cd <service-name> && ./mvnw test

# Run a single test class
cd <service-name> && ./mvnw test -Dtest=ClassName

# Build Docker image for a service
cd <service-name> && docker build -t <service-name> .
```

Services: `api-gateway`, `auth-service`, `patient-service`, `billing-service`, `analytics-service`

## Architecture

Microservices-based patient management system using Java 21 + Spring Boot 4.x.

### Services & Ports

| Service           | HTTP Port | gRPC Port |
|-------------------|-----------|-----------|
| api-gateway       | 4004      | —         |
| auth-service      | 4005      | —         |
| patient-service   | 4000      | —         |
| billing-service   | 4001      | 9001      |
| analytics-service | —         | —         |

### Communication Patterns

- **REST over HTTP**: All external-facing endpoints go through the API Gateway (port 4004)
- **gRPC**: `patient-service` calls `billing-service` at `billing-service:9001` using `BillingService.CreateBillingAccount` (defined in `billing_service.proto`)
- **Kafka**: `patient-service` publishes `PatientEvent` protobuf messages; `analytics-service` consumes them. Broker at `kafka:9092`.

### Request Flow

1. Client → API Gateway (4004)
2. Gateway validates JWT for `/api/patients/**` routes via `JwtAuthenticationFilter`
3. Gateway routes `/auth/**` → Auth Service (4005), `/api/patients/**` → Patient Service (4000)
4. On patient create/update: Patient Service → gRPC → Billing Service + Kafka → Analytics Service

### Proto Files

Each service has its own copy of the relevant `.proto` files under `src/main/proto/`:
- `patient_event.proto` — `PatientEvent` message (patientId, name, email, event_type); used by patient-service (producer) and analytics-service (consumer)
- `billing_service.proto` — `BillingService` RPC + request/response messages; used by patient-service (client) and billing-service (server)

### Key Patterns

- **JWT**: Auth service generates tokens; API Gateway validates them via `JwtUtil`. Secret key is injected via environment variable.
- **Database**: patient-service and auth-service use PostgreSQL in production; H2 in-memory for testing. Configured via `application.properties`.
- **DTO mapping**: patient-service uses `PatientMapper` to convert between `Patient` entity and `PatientRequestDTO`/`PatientResponseDTO`.
- **gRPC code generation**: `billing-service` and `patient-service` use `protobuf-maven-plugin`; generated code appears in `target/generated-sources/protobuf/`.

## Frontend

React 19 + Vite + Tailwind CSS app located in `frontend/`.

```bash
# Install dependencies
cd frontend && npm install

# Run dev server (default port 5173)
cd frontend && npm run dev

# Build for production
cd frontend && npm run build
```

**Key libraries:** `axios`, `react-router-dom`, `react-hook-form`, `react-hot-toast`, `lucide-react`

**Structure:**
- `src/api/` — Axios instance + auth/patient API calls (proxied to API Gateway at port 4004)
- `src/context/AuthContext.jsx` — JWT auth state, login/logout
- `src/pages/` — `LoginPage`, `DashboardPage`
- `src/components/` — `Navbar`, `PatientTable`, `PatientFormModal`, `DeleteConfirmModal`, `StatsCard`, `ProtectedRoute`, `LoadingSpinner`

The frontend talks exclusively to the API Gateway (`http://localhost:4004`). All `/api/patients/**` requests require a valid JWT (stored in `localStorage`).

## Testing HTTP Endpoints

Pre-written `.http` request files are in:
- `api-request/patient-service/` — CRUD operations for patients
- `grpc-requests/billing-service/` — gRPC billing account creation
