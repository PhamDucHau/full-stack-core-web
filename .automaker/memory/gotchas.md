---
tags: [gotcha, mistake, edge-case, bug, warning]
summary: Mistakes and edge cases to avoid
relevantTo: [error, bug, fix, issue, problem]
importance: 0.9
relatedFiles: []
usageStats:
  loaded: 5
  referenced: 0
  successfulFeatures: 0
---
# Gotchas

Mistakes and edge cases to avoid. These are lessons learned from past issues.

---



#### [Gotcha] Incomplete refactoring - changed header logo text in LandingNav.tsx but left matching text in LandingFooter.tsx and page.tsx untouched (2026-03-04)
- **Situation:** When searching for 'Car Parts' across the codebase, multiple instances were found but only one was modified
- **Root cause:** The implementation focused on the immediate grep search result without systematically identifying all occurrences that might need consistency updates
- **How to avoid:** Single targeted change is faster but risks creating brand inconsistency if other instances should also change; developer noted this in summary but didn't act on it