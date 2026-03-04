---
tags: [security]
summary: security implementation decisions and patterns
relevantTo: [security]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 1
  referenced: 1
  successfulFeatures: 1
---
# security

#### [Gotcha] Blog endpoints are implemented without authentication guards despite existing AuthModule in application (2026-02-27)
- **Situation:** Application has authentication infrastructure available but blog endpoints are publicly accessible
- **Root cause:** Intentionally left unsecured for initial CRUD implementation; decorator comment notes this can be added later with @UseGuards(AuthGuard)
- **How to avoid:** All users can create/modify/delete blogs (no access control); adding auth later requires modifying all controller methods

#### [Gotcha] Blog API endpoints lacked authentication guards present in other controllers (UserController), creating inconsistent security posture across API modules (2026-02-27)
- **Situation:** PR #3 introduced blog CRUD endpoints without @UseGuards(AuthGuard) decorator, while existing UserController consistently applied authentication to all endpoints
- **Root cause:** Inconsistent application of security patterns across modules creates vulnerabilities and maintenance burden - authentication should be enforced uniformly at the controller level for all protected resources
- **How to avoid:** Broad controller-level authentication is simpler to enforce and audit but requires explicit decisions on which routes should be public vs protected

#### [Gotcha] No authentication/authorization checks on Event endpoints - all CRUD operations open to any request (2026-02-28)
- **Situation:** Backend implements EventController with endpoints but no @UseGuards(JwtAuthGuard) or role-based checks
- **Root cause:** Existing codebase likely has auth setup (other modules likely guard endpoints) but Events module doesn't follow pattern. Security gap in production.
- **How to avoid:** No auth means simpler testing initially but security liability. Adding auth requires guard injection, role checks, token validation.

#### [Pattern] Email validation in both Zod schema and backend DTO (2026-03-01)
- **Problem solved:** User-entered email could be invalid format or genuinely bad
- **Why this works:** Frontend validation provides UX feedback (instant). Backend validation prevents bypassing frontend validation. Defense in depth.
- **Trade-offs:** Duplication of validation logic. But catches errors early on client, prevents server load from bad data.

### Event existence validation on payment create/update - prevents payments for non-existent events (2026-03-01)
- **Context:** Payment CRUD operations reference event records that may not exist
- **Why:** Prevents orphaned payment records and referential integrity violations. Fails fast at API level rather than database constraints, providing better error messages to client
- **Rejected:** Rely on database foreign key constraints only - slower feedback loop, generic database errors to client
- **Trade-offs:** Easier: Clear validation errors ('Event not found' vs database FK error). Harder: Extra query per operation to verify event
- **Breaking if changed:** If validation removed, can create payments for deleted events. Database constraints alone provide no feedback to users about why creation failed