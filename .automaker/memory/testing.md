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