# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A personal MkDocs-based knowledge base (Material theme) covering Guidewire BillingCenter, Gosu, architecture patterns, and privacy-focused AI tooling. Content lives entirely in `docs/` as Markdown; the site is auto-deployed to GitHub Pages on every push to `main`.

Live site: https://Sakthi-S99.github.io/guidewire-learning-journal/

## Local development

```bash
source venv/bin/activate
mkdocs serve          # → http://127.0.0.1:8000
mkdocs build --clean  # one-shot build to ./site/
```

The `venv/` already has `mkdocs-material` installed. No other build tools are needed.

## Navigation is explicit

`mkdocs.yml` contains a hand-maintained `nav:` block. When adding a new page, add it there too — MkDocs will warn about unlisted files but won't include them in the site navigation automatically.

## Content conventions

- **RCAs** — copy `docs/rca-library/template.md`, name the file `YYYY-MM-DD-short-description.md`, place it under `docs/rca-library/incidents/`, and register it in the `nav:` block.
- **Gosu code blocks** — use ` ```gosu ` fences and include `// Reason For Change:` / `// Edge Case:` comments for before/after snippets (mirrors the RCA template pattern).
- **Admonitions** — the Material theme is configured with `admonition`, `pymdownx.details`, and `pymdownx.superfences`; use `!!! note`, `!!! warning`, etc. freely.
- **Tags** — the `tags` plugin is active; add a tags line at the bottom of files where useful.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs `mkdocs-material` and runs `mkdocs build --clean` before deploying to GitHub Pages. No manual deploy step is needed.
