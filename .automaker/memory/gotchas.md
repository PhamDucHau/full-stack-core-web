---
tags: [gotcha, mistake, edge-case, bug, warning]
summary: Mistakes and edge cases to avoid
relevantTo: [error, bug, fix, issue, problem]
importance: 0.9
relatedFiles: []
usageStats:
  loaded: 6
  referenced: 1
  successfulFeatures: 1
---
# Gotchas

Mistakes and edge cases to avoid. These are lessons learned from past issues.

---



#### [Gotcha] Incomplete refactoring - changed header logo text in LandingNav.tsx but left matching text in LandingFooter.tsx and page.tsx untouched (2026-03-04)
- **Situation:** When searching for 'Car Parts' across the codebase, multiple instances were found but only one was modified
- **Root cause:** The implementation focused on the immediate grep search result without systematically identifying all occurrences that might need consistency updates
- **How to avoid:** Single targeted change is faster but risks creating brand inconsistency if other instances should also change; developer noted this in summary but didn't act on it

#### [Gotcha] Text typos in UI components can exist undetected despite being visible to end users, especially when the component structure splits text across multiple JSX elements (e.g., <span>Car</span> Partss) (2026-03-04)
- **Situation:** The typo 'Partss' existed in LandingNav.tsx line 37 where the brand name was split across a styled span and plain text
- **Root cause:** When text is fragmented across JSX elements with different styling, the cognitive burden of reading the full text is distributed, making typos harder to catch in code review and visual inspection
- **How to avoid:** Splitting styled text provides better control over component styling but increases the cognitive load for identifying text-based issues