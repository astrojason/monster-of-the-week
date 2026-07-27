# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS + Firebase (Firestore + Auth). Deployed to Vercel on push to `main`.

## Commands

```bash
npm run dev    # start dev server
npm run build  # production build
npm run lint   # ESLint
npm run seed   # seed Firestore with initial data
```

Work is not complete until `npm run build` exits without errors.

## Test-driven workflow

No automated tests exist yet. New features and bug fixes should add Vitest + React Testing Library tests before implementation.

All work must follow this cycle:
1. Write a failing test that demonstrates the bug or missing behaviour.
2. Implement the fix or feature.
3. Repeat until tests pass.
4. Confirm the build succeeds (`npm run build`).

## Error handling

Nothing is allowed to fail silently. Every `catch` block must surface the error in the UI as a copyable block containing the full error message — not a vague "Something went wrong." No empty `catch {}` blocks.

## TODO.md

Keep `TODO.md` up to date:

- Add an entry for every bug, feature, or enhancement before work begins.
- Remove items from TODO.md once the work has been committed — do not leave them checked off. The git log is the record.

## Versioning

The app version lives in `package.json` and must be displayed in the UI footer.

- Any commit touching files other than `CLAUDE.md` must include a version bump — patch for fixes, minor for new features, major for breaking changes. CLAUDE.md-only commits may use `--no-verify` to skip the bump.
- The version in the footer must be a clickable link to `/changelog`. The changelog page renders the git log — each entry shows the short hash and commit message (`git log --pretty=format:"%h %s" -n 50`). Implement as a Next.js API route if not already present.
