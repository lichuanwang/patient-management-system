# Patient Management System

A production-ready, cloud-native backend system for managing patient records in a healthcare environment. Built with a microservices architecture using Java 21 and Spring Boot 4.x, the system emphasizes security, scalability, and loose coupling between services.

---

## Purpose

Healthcare applications handle sensitive data that demand strict access control, high availability, and the ability to scale individual components independently. This project addresses those requirements by decomposing a traditional monolithic patient management system into focused, independently deployable microservices — each owning its own data and communicating through well-defined contracts (REST, gRPC, and Kafka events).

The result is a backend platform where:
- Patient records can be securely created, updated, and retrieved behind JWT-authenticated routes
- Billing accounts are provisioned automatically and synchronously when a new patient is registered
- Downstream systems (e.g. analytics) are notified of patient activity asynchronously without coupling them to the patient service

---

## Challenges & Solutions

### 1. Secure, Centralized Authentication
**Challenge:** With multiple services, enforcing authentication at every service boundary is error-prone and duplicates logic.

**Solution:** A dedicated **Auth Service** issues signed JWTs on login. The **API Gateway** intercepts every inbound request and delegates token validation back to the Auth Service before routing. Services behind the gateway never need to handle auth themselves.

### 2. Synchronous Cross-Service Data Consistency
**Challenge:** When a patient is created, a billing account must be provisioned immediately and the response must confirm it succeeded — ruling out async messaging for this flow.

**Solution:** **gRPC** is used for the `patient-service → billing-service` call. The strongly-typed Protobuf contract (`BillingService.CreateBillingAccount`) ensures both services agree on the schema at compile time, and the low-latency binary protocol keeps the synchronous round-trip fast.

### 3. Decoupled Event Propagation
**Challenge:** Multiple downstream services (analytics, notifications, auditing) may need to react to patient events, but the patient service should not need to know about any of them.

**Solution:** The `patient-service` publishes `PatientEvent` messages to **Apache Kafka** after mutations. Any number of consumers can subscribe independently. The `analytics-service` demonstrates this pattern — it processes events without the patient service having any awareness of it.

### 4. Scalability at the Service Level
**Challenge:** Different parts of the system have different scaling needs — the patient API may receive far more traffic than the billing service.

**Solution:** Each service is packaged as an independent **Docker image** using multi-stage builds, allowing them to be deployed and scaled individually. Services communicate over named hostnames (e.g. `billing-service:9001`), making the architecture compatible with container orchestration platforms like Kubernetes.

---

## Architecture

```
                        ┌─────────────────────────────┐
                        │       API Gateway :4004       │
                        │  (Spring Cloud Gateway)       │
                        │  JWT validation via auth svc  │
                        └────────────┬────────────────┬─┘
                                     │                │
                          /auth/**   │                │  /api/patients/**
                                     ▼                ▼
                           ┌──────────────┐   ┌──────────────────┐
                           │ Auth Service │   │ Patient Service  │
                           │    :4005     │   │     :4000        │
                           └──────────────┘   └────┬─────────┬───┘
                                                   │ gRPC    │ Kafka
                                                   ▼         ▼
                                      ┌─────────────────┐  ┌──────────────────┐
                                      │ Billing Service │  │Analytics Service │
                                      │  HTTP :4001     │  │  (consumer)      │
                                      │  gRPC :9001     │  └──────────────────┘
                                      └─────────────────┘
```

### Services

| Service            | Port(s)               | Responsibility                                               |
|--------------------|-----------------------|--------------------------------------------------------------|
| `api-gateway`      | HTTP 4004             | Single entry point; JWT enforcement; request routing         |
| `auth-service`     | HTTP 4005             | User login, JWT issuance and validation                      |
| `patient-service`  | HTTP 4000             | Patient CRUD; gRPC client to billing; Kafka producer         |
| `billing-service`  | HTTP 4001 / gRPC 9001 | Billing account provisioning via gRPC                        |
| `analytics-service`| —                     | Kafka consumer; processes and logs patient events            |

---

## Tech Stack

| Layer                  | Technology                                      |
|------------------------|-------------------------------------------------|
| Language & Runtime     | Java 21                                         |
| Framework              | Spring Boot 4.x                                 |
| API Gateway            | Spring Cloud Gateway (WebFlux / reactive)       |
| Authentication         | Spring Security + JJWT 0.12.6 (HS256, 10h TTL) |
| Sync service comms     | gRPC 1.69.0 + Protocol Buffers                  |
| Async event streaming  | Apache Kafka + Protobuf serialization           |
| Persistence            | Spring Data JPA — PostgreSQL (prod) / H2 (test) |
| API Documentation      | SpringDoc OpenAPI (Swagger UI aggregated at gateway) |
| Containerization       | Docker multi-stage builds (Eclipse Temurin JRE 21) |
| Build tool             | Maven 3.9.x                                     |

---

## Impact

- **Security by default:** No patient data is accessible without a valid JWT — enforced at the gateway layer before any service code runs.
- **Fault isolation:** A failure in the billing or analytics service does not bring down the patient API. Services degrade independently.
- **Schema-safe contracts:** gRPC + Protobuf means breaking changes between services are caught at compile time, not at runtime in production.
- **Extensible event pipeline:** Adding a new consumer (notifications, audit logging, ML pipeline) requires zero changes to the patient service — just a new Kafka consumer group.
- **Operationally independent deployments:** Each service can be built, tested, and deployed on its own release cycle.

---

## Getting Started

### Prerequisites

- Java 21+
- Maven 3.9+ (or use the included `./mvnw` wrapper)
- Docker
- A running PostgreSQL instance
- A running Kafka broker at `kafka:9092`

### Running a Service Locally

```bash
cd <service-name>
./mvnw spring-boot:run
```

### Building a Docker Image

```bash
cd <service-name>
docker build -t <service-name> .
```

### Environment Variables

| Variable           | Service(s)                        | Description                                          |
|--------------------|-----------------------------------|------------------------------------------------------|
| `jwt.secret`       | `auth-service`, `api-gateway`     | Base64-encoded HMAC secret key for JWT signing       |
| `auth.service.url` | `api-gateway`                     | Auth service base URL (e.g. `http://auth-service:4005`) |
| Spring datasource  | `auth-service`, `patient-service` | Standard `spring.datasource.*` properties for PostgreSQL |

---

## API Reference

All endpoints are accessed through the **API Gateway on port 4004**.

### Authentication

| Method | Endpoint          | Auth Required | Description                  |
|--------|-------------------|---------------|------------------------------|
| POST   | `/auth/login`     | No            | Returns a signed JWT token   |
| GET    | `/auth/validate`  | Bearer token  | Validates a JWT              |

**Login request:**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
**Login response:**
```json
{ "token": "<jwt>" }
```

### Patients

All patient endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | `/api/patients`          | List all patients        |
| POST   | `/api/patients`          | Create a patient         |
| PUT    | `/api/patients/{id}`     | Update a patient by UUID |
| DELETE | `/api/patients/{id}`     | Delete a patient by UUID |

**Create/Update request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-15",
  "registeredDate": "2024-03-01"
}
```
> `registeredDate` is required on creation (POST) and ignored on update (PUT).

**Response:**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "dateOfBirth": "1990-01-15",
  "address": "123 Main St"
}
```

### Swagger UI

Aggregated API documentation for all services:
```
http://localhost:4004/swagger-ui.html
```
Use the **"Select a definition"** dropdown to switch between Auth and Patient service docs.

---

## Service Communication Contracts

### gRPC — Billing Service (`billing_service.proto`)

```protobuf
service BillingService {
  rpc CreateBillingAccount (BillingRequest) returns (BillingResponse);
}

message BillingRequest  { string patientId = 1; string name = 2; string email = 3; }
message BillingResponse { string accountId = 1; string status = 2; }
```

### Kafka — Patient Events (`patient_event.proto`)

```protobuf
message PatientEvent {
  string patientId  = 1;
  string name       = 2;
  string email      = 3;
  string event_type = 4;
}
```

---

## Repository Structure

```
patient-management/
├── api-gateway/          # Spring Cloud Gateway — routing & JWT enforcement
├── auth-service/         # Authentication — login & token validation
├── patient-service/      # Core patient CRUD — gRPC client, Kafka producer
├── billing-service/      # gRPC server — billing account management
├── analytics-service/    # Kafka consumer — patient event processing
├── api-request/          # HTTP test request files (patient CRUD)
└── grpc-requests/        # gRPC test request files (billing)
```