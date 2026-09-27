# Zaplink

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19 with react-compiler, Tailwind CSS v4, shadcn/ui with BaseUI

## Code Standards

- **Strict TypeScript, no `any`.** `tsc --noEmit` must pass.
- **Server components by default.** Use `"use client"` only where interactivity is required.
- **Use `bun`, never `npm`.**

## Working Rules
- No em-dashes anywhere in this repo's prose (SKILL.md files, docs, README.md, CHANGELOG.md, ADRs, changesets, code comments). Where a sentence reaches for one, rewrite it instead with a comma, colon, period, parentheses, or a conjunction, whichever the sentence actually wants; never do a blind character substitution.
- Apply ASD-STE100 style for writing and communication.
