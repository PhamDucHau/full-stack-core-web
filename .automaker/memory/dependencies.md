---
tags: [dependencies]
summary: dependencies implementation decisions and patterns
relevantTo: [dependencies]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# dependencies

#### [Gotcha] Implicit peer dependency resolution: class-validator and class-transformer must be explicitly listed as dependencies even though they're core to NestJS decorator-based DTO validation patterns (2026-02-27)
- **Situation:** DTOs used @IsString(), @IsNotEmpty() decorators from class-validator but the package was missing from package.json. The code was written assuming these would be available
- **Root cause:** NestJS framework documentation assumes developers manually add validation libraries, but doesn't auto-install them. This is a common gotcha where framework-adjacent libraries aren't bundled
- **How to avoid:** Adds two dependencies but enables declarative validation syntax in DTOs. Alternative would be manual validation in service layer, which is more verbose and error-prone