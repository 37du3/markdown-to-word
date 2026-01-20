---
name: api-design-principles
description: Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers. Use when designing new APIs, reviewing API specifications, or establishing API design standards.
---

# API Design Principles

Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers and stand the test of time.

## When to Use This Skill

- Designing new REST or GraphQL APIs
- Refactoring existing APIs for better usability
- Establishing API design standards for your team
- Reviewing API specifications before implementation
- Migrating between API paradigms (REST to GraphQL, etc.)
- Creating developer-friendly API documentation
- Optimizing APIs for specific use cases (mobile, third-party integrations)

## Core Concepts

### 1. RESTful Design Principles

**Resource-Oriented Architecture**

- Resources are nouns (users, orders, products), not verbs
- Use HTTP methods for actions (GET, POST, PUT, PATCH, DELETE)
- URLs represent resource hierarchies
- Consistent naming conventions

**HTTP Methods Semantics:**

- `GET`: Retrieve resources (idempotent, safe)
- `POST`: Create new resources
- `PUT`: Replace entire resource (idempotent)
- `PATCH`: Update resource partially (idempotent recommended)
- `DELETE`: Remove resource (idempotent)

**Status Codes:**

- `2xx`: Success (200 OK, 201 Created, 204 No Content)
- `3xx`: Redirection (301 Moved Permanently, 304 Not Modified)
- `4xx`: Client Error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests)
- `5xx`: Server Error (500 Internal Server Error, 503 Service Unavailable)

### 2. GraphQL Design Principles

**Schema-First Design**

- Design the schema based on how data is *used*, not how it's stored
- Use the Type System effectively (Scalars, Enums, Interfaces, Unions)
- Names should be descriptive and specific
- Avoid exposing implementation details

**Query Efficiency**

- Avoid N+1 problems using DataLoaders
- Implement pagination (Cursor-based preferred over Offset-based)
- Use fragments for reusable query parts
- Limit query depth and complexity

### 3. API Security Best Practices

- **Authentication**: Use standard protocols (OAuth2, OIDC, JWT)
- **Authorization**: Implement RBAC (Role-Based Access Control) or ABAC (Attribute-Based)
- **Input Validation**: Validate all inputs, sanitize data to prevent injection attacks
- **Rate Limiting**: Protect against DoS attacks and abuse
- **HTTPS**: Encrypt all data in transit

### 4. Developer Experience (DX)

- **Consistent Naming**: CamelCase vs Snake_Case (pick one and stick to it)
- **Clear Error Messages**: Provide actionable error details (code, message, help link)
- **Documentation**: Keep documentation up-to-date (OpenAPI/Swagger, GraphiQL)
- **Versioning**: Plan for changes without breaking clients (URL versioning, Header versioning)

## Process

### Step 1: Define Requirements & Domain Model

Before designing endpoints or schema, understand the domain.

1.  Identify key **Resources** (Users, Products, Orders)
2.  Define **Relationships** (User has many Orders)
3.  Determine **Operations** needed (Create Order, Cancel Order, Get User Profile)

### Step 2: Choose Paradigm (REST vs GraphQL)

**Choose REST when:**
- Caching is critical (HTTP caching is mature)
- Simple resource-based access is sufficient
- You need broad client compatibility
- Team is more experienced with REST

**Choose GraphQL when:**
- You need to fetch data from multiple sources in one request
- Client needs flexible data fetching (over-fetching/under-fetching is a concern)
- Rapid iteration on frontend is required
- Bandwidth usage needs to be minimized (mobile)

### Step 3: Design the Interface

**For REST:**
- Define URL structure: `/api/v1/resources`
- Map operations to HTTP methods
- Define JSON request/response bodies

**For GraphQL:**
- Define Types and Inputs in schema (SDL)
- Define Queries and Mutations
- Plan resolvers

### Step 4: Review and Refine

- **Consistency Check**: Are field names consistent? (e.g., `userId` vs `user_id`)
- **Error Handling**: Are error scenarios covered?
- **Performance**: Are there potential bottlenecks? (e.g., returning large lists without pagination)

### Step 5: Documentation & Mocking

- Create OpenAPI spec or GraphQL schema
- specific **Examples** for requests and responses
- Set up a mock server for frontend developers

## Best Practices Checklist

### General

- [ ] Use nouns for resources
- [ ] Use consistent casing (camelCase for JSON is standard)
- [ ] Support filtering, sorting, and pagination for collections
- [ ] Use standard status codes
- [ ] Version the API
- [ ] Secure with HTTPS and Auth headers

### REST Specific

- [ ] `GET`, `PUT`, `DELETE` should be idempotent
- [ ] Use `PATH` parameters for IDs (`/users/123`)
- [ ] Use `QUERY` parameters for filtering/sorting (`/users?role=admin`)
- [ ] HATEOAS (Hypermedia) - Optional but consider for discoverability

### GraphQL Specific

- [ ] Use `Input` types for arguments
- [ ] Return complex objects from mutations (payloads)
- [ ] Handle errors in `errors` array, data in `data`
- [ ] Deprecate fields instead of removing them immediately

## Anti-Patterns to Avoid

- **Verbs in URLs (REST)**: `/getAllUsers` (Wrong) -> `/users` (Right)
- **Tunneling**: Sending everything via POST (RPC style in REST clothing)
- **God Objects**: Returning massive objects with unnecessary data
- **Leakage**: Exposing database column names or internal IDs directly
- **Inconsistent Errors**: Returning 200 OK for errors, or different error structures

## Tools

- **Swagger / OpenAPI**: For REST API design and documentation
- **Postman / Insomnia**: For testing and exploration
- **Apollo Studio / GraphQL Playground**: For GraphQL schema visualization and testing
- **Spectral**: For linting OpenAPI specs

## Example: Designing a User Profile API

**Goal**: Allow users to view and update their profile.

**REST Approach:**

- `GET /api/v1/me`: Get current user profile
- `PATCH /api/v1/me`: Update specific fields (email, bio)
- `GET /api/v1/users/{id}`: Get public profile of another user

**GraphQL Approach:**

```graphql
type Query {
  viewer: User
  user(id: ID!): User
}

type Mutation {
  updateProfile(input: UpdateProfileInput!): UpdateProfilePayload
}
```

## Troubleshooting

- **"CORS Errors"**: Check `Access-Control-Allow-Origin` headers.
- **"401 Unauthorized"**: Check Bearer token format and expiration.
- **"N+1 Performance Issues"**: Verify database queries per request.

## Advanced Topics

- **HATEOAS**: Hypermedia as the Engine of Application State
- **gRPC**: For high-performance internal microservices
- **Federation**: Stitching multiple GraphQL schemas

## Artifacts

- **API Specification**: OpenAPI yaml or GraphQL schema file
- **Design Document**: Rationale, constraints, and trade-offs

## Summary

Great API design is about **empathy for the developer**. Make it easy to do the right thing and hard to do the wrong thing.
