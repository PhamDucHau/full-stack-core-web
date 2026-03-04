---
tags: [validation]
summary: validation implementation decisions and patterns
relevantTo: [validation]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 4
  referenced: 4
  successfulFeatures: 4
---
# validation

### Implemented category existence validation at service layer (findById in create/update) rather than using Mongoose pre-hooks or class-validator decorators (2026-02-28)
- **Context:** Products require valid category references but category validation depends on database lookup, not schema constraints
- **Why:** Service-layer validation provides explicit error messaging and control flow. Pre-hooks are hidden from service logic and harder to test; class-validator can't perform async DB lookups. Allows returning specific BadRequestException with message 'Category not found'
- **Rejected:** Mongoose pre-save hooks would execute before validation and are harder to test in isolation; custom class-validator decorator would introduce async complexity in DTO layer
- **Trade-offs:** Validation happens after DTO validation but before save (+1 DB call for creates) but provides clear, testable validation logic. Service layer stays clean and explicit
- **Breaking if changed:** Removing this validation allows orphaned products with non-existent categoryIds; adding async validation to DTOs complicates request pipeline and hides validation from service logic