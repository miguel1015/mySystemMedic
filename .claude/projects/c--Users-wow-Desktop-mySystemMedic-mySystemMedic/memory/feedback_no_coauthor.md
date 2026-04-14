---
name: No Co-Authored-By in commits
description: User does not want Co-Authored-By Claude lines in git commit messages
type: feedback
---

Do not include the `Co-Authored-By: Claude ...` line in commit messages.

**Why:** User explicitly rejected a commit that included it.
**How to apply:** When creating git commits, omit the Co-Authored-By trailer entirely.
