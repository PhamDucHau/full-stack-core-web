---
tags: [database]
summary: database implementation decisions and patterns
relevantTo: [database]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 2
  referenced: 2
  successfulFeatures: 2
---
# database

#### [Pattern] Using MongoDB regex with $options: 'i' for case-insensitive search on title field only (2026-02-27)
- **Problem solved:** Implementing search functionality for blog list without full-text search indexes
- **Why this works:** Regex search on single field is simple to implement with Mongoose, case-insensitive option provides good UX, avoids overhead of text indexes for basic use case
- **Trade-offs:** Regex can be slow on large datasets (scales with collection size), but acceptable for moderate blog counts; limited to exact field matching vs semantic search

#### [Gotcha] Service catches invalid ObjectId format in updateOne/deleteOne operations and converts to BadRequestException (2026-02-27)
- **Situation:** MongoDB throws CastError when ObjectId format is invalid, but controller shouldn't expose database exceptions
- **Root cause:** Converts low-level database errors into HTTP-appropriate exceptions; clients receive consistent error response format rather than Mongoose error objects
- **How to avoid:** Additional error handling logic needed; abstraction layer prevents database leak but obscures root cause slightly

### Used ObjectId references with manual population via findOne/find().populate() instead of embedded documents or automatic population via schema virtuals (2026-02-28)
- **Context:** One-to-Many relationship between CategoryProduct and Product where products reference their category
- **Why:** Allows categories to exist independently, supports filtering products by categoryId, prevents data duplication, and provides query flexibility for both listing categories without product data and fetching products with category details
- **Rejected:** Embedded products array in CategoryProduct schema would create denormalization and require manual sync on product deletion; Virtual populate would require additional schema configuration
- **Trade-offs:** Manual populate() calls required in service methods (+1 extra query per operation) but gains granular control over when category data is fetched. Prevents N+1 queries if used incorrectly but requires discipline in service methods
- **Breaking if changed:** Removing populate() calls in findAll()/findOne() product methods breaks category information in API responses, making category filtering and display impossible. Removing ObjectId ref breaks relationship enforcement

#### [Gotcha] Category deletion protection checks product count at delete time rather than using Mongoose cascade delete or database foreign key constraints (2026-02-28)
- **Situation:** System should prevent deleting categories that have products, but MongoDB lacks native foreign key constraints
- **Root cause:** Manual check via findCount() is explicit and testable. Provides custom error message 'Cannot delete category with X products'. Allows soft-delete pattern if needed later without schema changes
- **How to avoid:** Requires manual check (+1 query) but prevents data integrity issues and provides better error feedback. If product count checking is removed, deleted categories leave orphaned products

### Applied unique constraint on CategoryProduct name at Mongoose schema level using @Prop({unique: true}) rather than database index (2026-02-28)
- **Context:** Category names must be globally unique to prevent duplicate categories
- **Why:** Mongoose validates uniqueness before database write, catching duplicates early. Cleaner error messages via class-validator. Simpler than manual unique checks in service
- **Rejected:** Manual service-layer check would require findOne() on every create/update; database-only constraint provides no application-level validation; no constraint allows duplicates
- **Trade-offs:** Requires index creation (automatic) but prevents duplicate inserts at application level. If constraint is removed, duplicate categories can be created
- **Breaking if changed:** Removing unique constraint allows duplicate category names, breaking business invariants; removing from schema removes validation before database call

#### [Gotcha] Schema fields (title, description, location, startDate, endDate, price, isPublished, image) with no explicit index on searchable fields (2026-02-28)
- **Situation:** Query service implements case-insensitive regex search on title field without ensuring index exists
- **Root cause:** Regex queries on non-indexed fields cause full collection scans, severe performance degradation at scale. Need index: `db.events.createIndex({title: 'text'})` or compound index for common queries. Current implementation will work for small datasets but fail in production.
- **How to avoid:** Current code 'works' for testing but hides performance issue. Adding index requires migration strategy if data exists.

#### [Pattern] Auto-setting paidAt to null when status is not SUCCESS, and to current date when SUCCESS (2026-03-01)
- **Problem solved:** Payment history tracking requires knowing when payment was actually completed vs pending/failed
- **Why this works:** Null indicates transaction not finalized. Only SUCCESS status represents completed transaction. This prevents stale dates when status reverts.
- **Trade-offs:** Slightly more database writes per update, but maintains data integrity. Queries can safely assume paidAt null = not finalized.

#### [Gotcha] Event reference stored as reference (eventId) not embedded, requiring population on every query (2026-03-01)
- **Situation:** PaymentTable displays event title and price; payment form needs event list for dropdown; queries return just eventId
- **Root cause:** Maintains referential integrity and avoids data duplication. Event title/price changes don't require payment record updates. Standard normalized schema design
- **How to avoid:** Easier: Single source of truth for event data. Harder: Every payment query needs explicit population step, potential N+1 queries if not careful