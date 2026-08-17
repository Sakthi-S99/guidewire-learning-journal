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
├── rca-library/                      # Root cause analyses from real incidents
│   ├── index.md
│   ├── template.md
│   └── incidents/
└── ai-privacy/                       # Local LLM & privacy-focused AI tooling
    ├── index.md                      # Stack philosophy & architecture (Arivu)
    ├── rag-pipeline.md
    └── rag-reference.md
```

Navigation is hand-maintained in `mkdocs.yml` — when adding a page, register it there too.

---

## Local Development

```bash
source venv/bin/activate
mkdocs serve          # → http://127.0.0.1:8000
mkdocs build --clean  # one-shot build to ./site/
```

`venv/` already has `mkdocs-material` installed — no other setup needed.

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) auto-deploys to GitHub Pages.

---

## Writing Guide

- **RCAs** → copy `docs/rca-library/template.md`, name it `YYYY-MM-DD-short-description.md`, place it under `docs/rca-library/incidents/`, and register it in `nav:`.
- **Gosu code blocks** → use ` ```gosu ` fences with `// Reason For Change:` / `// Edge Case:` comments for before/after snippets.
- **Concepts** → one topic per file, cross-link related pages.
- **Admonitions** → `!!! note`, `!!! warning`, etc. are available via `admonition` / `pymdownx.details`.
- **Tags** → the `tags` plugin is active; add a tags line at the bottom of files where useful.

---

© Sakthi. All rights reserved. This is a personal portfolio/knowledge base; content may be viewed but not republished or reused without permission.
