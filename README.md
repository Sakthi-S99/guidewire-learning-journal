# Learning Journal

Personal knowledge base — Guidewire BillingCenter, Gosu, architecture patterns, and privacy-focused local AI tooling. Built with MkDocs Material.

📖 **Live site:** https://Sakthi-S99.github.io/guidewire-learning-journal/

---

## Structure

```
docs/
├── index.md                          # Home
├── about.md                          # About & resume
├── certifications.md
├── projects/                         # Things I've built — RAG pipelines, local AI tooling, etc.
│   ├── index.md                      # Overview / project index — add a row per new project
│   └── rag-pipeline.md               # Arivu RAG pipeline write-up
├── architecture/
│   ├── index.md                      # Overview
│   ├── design-decisions/
│   └── integration-patterns/
├── concepts/                         # BillingCenter domain knowledge
│   ├── index.md
│   ├── billing-center-core/
│   ├── invoicing/
│   ├── payment-plans/
│   └── delinquency/
├── gosu-patterns/                    # Reusable code patterns & pitfalls
│   ├── index.md
│   ├── bundle-handling.md
│   ├── query-patterns.md
│   ├── plugin-patterns.md
│   └── common-pitfalls.md
└── ai-privacy/                       # Local LLM & privacy-focused AI tooling
    ├── index.md                      # Stack philosophy & architecture (Arivu)
    ├── rag-pipeline.md               # RAG architecture & implementation logic
    └── rag-reference.md              # ADRs, glossary, phase log

drafts/                               # Not published — excluded from docs/ and mkdocs nav
└── rca-library/                      # RCA library, parked until real incidents are written
    ├── index.md
    ├── template.md
    └── incidents/                    # created as RCAs are added
```

Navigation is hand-maintained in `mkdocs.yml` — when adding a page, register it there too. Anything under `drafts/` is intentionally excluded from both `docs/` and `mkdocs.yml`, so it never builds or ships to the live site.

---

## Local Development

```bash
source venv/bin/activate
mkdocs serve          # → http://127.0.0.1:8000
mkdocs build --clean  # one-shot build to ./site/
```

`venv/` already has `mkdocs-material[imaging]` installed (the `imaging` extra — `cairosvg` + `Pillow` — is required for the `social` plugin's auto-generated preview cards) — no other setup needed.

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys to GitHub Pages.

---

## Writing Guide

- **Projects** → add a page under `docs/projects/`, add a row to `docs/projects/index.md`'s table, and register it in `nav:`.
- **RCAs** → the library is parked under `drafts/rca-library/` until real incidents exist. To activate it: move `drafts/rca-library/` back into `docs/`, copy `template.md`, name it `YYYY-MM-DD-short-description.md`, place it under `docs/rca-library/incidents/`, and register the section in `nav:`.
- **Gosu code blocks** → use ` ```gosu ` fences with `// Reason For Change:` / `// Edge Case:` comments for before/after snippets.
- **Concepts** → one topic per file, cross-link related pages.
- **Admonitions** → `!!! note`, `!!! warning`, etc. are available via `admonition` / `pymdownx.details`.
- **Tags** → the `tags` plugin is active; add a tags line at the bottom of files where useful.

---

© Sakthi. All rights reserved. This is a personal portfolio/knowledge base; content may be viewed but not republished or reused without permission.
