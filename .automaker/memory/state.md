---
tags: [state]
summary: state implementation decisions and patterns
relevantTo: [state]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 3
  referenced: 3
  successfulFeatures: 3
---
# state

#### [Gotcha] Category dropdown in ProductForm must independently fetch categories list, not reuse products page category filter - two separate queries needed (2026-02-28)
- **Situation:** Product form appears in dialog on products page which already fetches products; refactoring might assume category list already loaded
- **Root cause:** The products list query may have active category filter applied (limiting results). Form needs all categories available to user can change product's category. Reusing filtered category list would only show currently selected category.
- **How to avoid:** Adds one extra API call when opening product form, but form becomes standalone and self-contained

#### [Pattern] React Query hooks (useCategoryProducts, useProducts) return data/isLoading/error plus mutations in separate hooks (useCreateCategoryProduct) rather than one mega-hook (2026-02-28)
- **Problem solved:** Each page needs query hook on mount and mutation hooks on form submission
- **Why this works:** Separation allows component to subscribe only to queries it uses. useCategoryProducts doesn't trigger mutation. Mutation hook can be used in isolated form component without page context.
- **Trade-offs:** More hook calls in component but cleaner dependency boundaries. Form components fully standalone.