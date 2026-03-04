---
tags: [testing]
summary: testing implementation decisions and patterns
relevantTo: [testing]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# testing

#### [Gotcha] Category deletion has no cascade delete protection on backend - orphaned products will remain after category deleted (2026-02-28)
- **Situation:** Summary notes flagged this as 'no cascade delete implemented' but implementation doesn't prevent user from deleting in-use categories
- **Root cause:** Frontend has no relationship integrity checks. Backend likely has same issue. User can delete category from dropdown even if products reference it.
- **How to avoid:** Simple delete implementation vs data integrity risk. Solution requires backend cascade delete or soft-delete approach.

#### [Gotcha] Status update logic must be tested in isolation (PATCH endpoint) AND in create/update flows since both trigger paidAt changes (2026-03-01)
- **Situation:** Business logic for setting/clearing paidAt exists in multiple code paths
- **Root cause:** Ensures consistency across all payment state changes. Single source of truth would be helper function, but spread across service means testing prevents divergence.
- **How to avoid:** More test cases required, but catches subtle bugs where status logic diverges between endpoints.

#### [Gotcha] PaymentTable status dropdown relies on usePaymentUpdate hook which requires React Query setup - integration test complexity (2026-03-01)
- **Situation:** Changing status from table cell dropdown invokes mutation that needs mocking
- **Root cause:** Realistic pattern - mutations tied to UI components. Ensures status changes actually update server
- **How to avoid:** Easier: Tests catch real issues. Harder: Need React Query mock setup, async test handling, loading states

#### [Gotcha] Playwright end-to-end tests cannot be easily executed in resource-constrained environments (missing system dependencies like libglib-2.0.so.0), requiring fallback to static code verification (2026-03-04)
- **Situation:** Attempted to create and run Playwright tests to verify the UI text change, but browser installation failed due to missing system libraries
- **Root cause:** Playwright requires the full browser runtime stack including system-level graphics and C libraries, which may not be available in minimal CI/CD or development environments
- **How to avoid:** Static code verification is faster and more reliable in constrained environments but provides less assurance about actual UI rendering compared to browser-based tests