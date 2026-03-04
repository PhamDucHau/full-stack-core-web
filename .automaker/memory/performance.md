---
tags: [performance]
summary: performance implementation decisions and patterns
relevantTo: [performance]
importance: 0.7
relatedFiles: []
usageStats:
  loaded: 0
  referenced: 0
  successfulFeatures: 0
---
# performance

#### [Pattern] Table data, search value, and pagination state all lifted to parent page component, not kept in child table component (2026-02-27)
- **Problem solved:** BlogTable component needs to be controlled by parent to coordinate with pagination and search
- **Why this works:** Single source of truth for data flow. Parent can coordinate between search input, table data, and pagination. Prevents data sync bugs where table has stale data
- **Trade-offs:** More props drilling but clearer data flow. Parent component becomes source of truth

### Image preview in ProductForm uses img tag with error handler rather than canvas-based image validation or external image service (2026-02-28)
- **Context:** ProductForm accepts image URL input; needs to validate URL points to real image before submission
- **Why:** img.onerror event is lightweight, instant feedback, no external dependencies. Works offline. Simple to implement.
- **Rejected:** Canvas-based validation requires loading entire image, higher CPU cost. External image service adds latency and dependency.
- **Trade-offs:** Only detects broken URLs, doesn't validate image format/dimensions. Won't catch corrupted images that load partially.
- **Breaking if changed:** If logic changed to preload images to validate dimensions/format, form would freeze during image load on slow networks

#### [Gotcha] EventTable renders full image thumbnails in table rows without lazy loading or image optimization (no next/image) (2026-02-28)
- **Situation:** Each event row displays image, potential for dozens of rows, all images loaded simultaneously
- **Root cause:** Raw <img> tags load immediately, unoptimized, no progressive loading. Should use next/image for automatic optimization, lazy loading by default. Current implementation could cause slow table renders with many images.
- **How to avoid:** Raw images simpler to implement but worse performance. next/image adds boilerplate but automatic optimization.

#### [Pattern] 300ms debounce on search field with React Query hooks (2026-03-01)
- **Problem solved:** Payment search filters by userName/userEmail needs to avoid excessive API calls while typing
- **Why this works:** Balances responsiveness (user sees results while typing) with server load. 300ms is standard for text search - faster feels laggy for network requests, slower feels unresponsive
- **Trade-offs:** Easier: Fewer API calls, better server performance. Harder: UI not instantly responsive to every keystroke, minor lag perception