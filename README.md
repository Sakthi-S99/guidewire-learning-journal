# Learning Journal

Personal knowledge base — BillingCenter, Gosu, Architecture & Privacy-focused AI.

📖 **Live site:** https://<your-github-username>.github.io/guidewire-learning-journal/

---

## Structure

```
docs/
├── concepts/           # BC domain knowledge
│   ├── invoicing/
│   ├── payment-plans/
│   ├── delinquency/
│   └── billing-center-core/
├── gosu-patterns/      # Reusable code patterns & pitfalls
├── architecture/       # Design decisions & integration patterns
├── rca-library/        # Root cause analyses from real incidents
│   └── incidents/
└── ai-privacy/         # Local LLM & privacy-focused AI tooling
```

---

## Local Development

```bash
pip install mkdocs-material
mkdocs serve
# → http://127.0.0.1:8000
```

Push to `main` → GitHub Actions auto-deploys to GitHub Pages.

---

## Writing Guide

- **RCAs** → Copy `docs/rca-library/template.md`, name as `YYYY-MM-DD-description.md`
- **Concepts** → One topic per file, link related files
- **Patterns** → Include before/after code with `// Reason For Change:` comments
