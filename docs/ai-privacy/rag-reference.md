# Arivu RAG — Technical Reference

> Running record of key concepts, decisions, and implementations across each phase. Used as human reference and as grounding material for future agents.

---

## Glossary — Core Keywords

| Term | Meaning |
|---|---|
| **Chunk** | A fixed-size slice of a document (700 words, 100 overlap) that becomes one searchable unit |
| **Embedding** | A 1024-dim vector representing the meaning of a chunk, produced by BGE-M3 |
| **Vector** | The numeric form of text used for similarity search |
| **Point** | A Qdrant record: `id` + `vector` + `payload` |
| **Payload** | Metadata + original text stored alongside a vector (`source`, `chunk_index`, `text`) |
| **Collection** | A named set of points in Qdrant (`arivu_kb`) |
| **Cosine similarity** | Distance metric — angle between vectors; measures meaning similarity |
| **HNSW** | Hierarchical Navigable Small World — graph index for fast approximate nearest-neighbor search |
| **Top-K** | Number of nearest chunks retrieved per query (5) |
| **RAG** | Retrieval-Augmented Generation — retrieve context, then generate answer grounded in it |
| **Idempotent ingest** | Re-running produces no duplicates (deterministic IDs) |

---

## Architecture Decisions (ADRs)

### ADR-1: Qdrant over other vector DBs
- **Decision:** Qdrant
- **Why:** Local, fast, metadata filtering, production-ready, lightweight on 16GB
- **Rejected:** Cloud vector DBs (privacy), Neo4j (not needed until concept graphs)

### ADR-2: Plain Python over LangChain
- **Decision:** Plain Python + qdrant-client
- **Why:** Full pipeline visibility, learning value, reusable for PrithviVeda, no abstraction bloat
- **Revisit:** Layer LangChain at orchestration phase if needed

### ADR-3: Fixed-size chunking over semantic
- **Decision:** Fixed 700 words, 100 overlap
- **Why:** Simple, reliable, good for text-heavy docs
- **Revisit:** Structure-aware chunking if retrieval quality is poor

### ADR-4: Deterministic chunk IDs (UUID5)
- **Decision:** `uuid5(namespace, "source::index")`
- **Why:** Re-ingest overwrites instead of duplicating; crash-safe resume
- **Trade-off:** Editing a doc to fewer chunks leaves orphan points → use `--reset`

### ADR-5: Word-based chunking (no tokenizer)
- **Decision:** Split on words, ~1.3 words ≈ 1 token
- **Why:** Avoids heavy tokenizer dependency, keeps RAM low
- **Trade-off:** Approximate token counts — acceptable for retrieval

### ADR-6: Content-hash dedup at query time
- **Decision:** SHA256 of chunk text; merge duplicate content, keep all sources
- **Why:** Same text in 2 files wastes context window
- **Behavior:** `[Source: fileA.pdf, fileB.pdf]` for shared content

### ADR-7: On-disk vector storage
- **Decision:** `on_disk=True` on collection vectors
- **Why:** Vectors on SSD, HNSW index in RAM — frees memory for LLM during queries on 16GB
- **Trade-off:** Marginal cold-read latency (negligible on NVMe SSD)
- **Impact:** RAM footprint drops from ~120MB vectors to index-only (~20-40MB)

---

## Key Implementation Logic

### Chunking
- Word-split, sliding window of `size - overlap`
- Overlap preserves context across boundaries
- Empty chunks skipped

### Embedding
- POST to Ollama `/api/embeddings`, model `bge-m3:latest`
- **Critical:** same model for ingest and query — vectors must share the same space
- Output: 1024-dim vector

### Storage (Qdrant)
- Point = `id` (deterministic) + `vector` (1024d) + `payload`
- Upsert = update-or-insert on ID → idempotent
- Persisted in Docker volume `qdrant_storage`

### Resume
- `.ingest_state.json` tracks completed files
- Checkpoint after each file
- Crash → resume skips done files
- `--reset` clears state + collection

### Retrieval
- Embed question → search top-5 by cosine
- Dedup by content hash
- Build context with source labels
- LLM answers from context only (anti-hallucination)

---

## Adding Documents — Workflow

### Routine additions (new files)
```bash
# 1. Drop new PDFs into the knowledge base
cp ~/Downloads/new-doc.pdf ~/ai-knowledge-base/

# 2. Start services
ollama-local && qdrant-start

# 3. Ingest — resume logic processes ONLY new files
arivu-ingest
```

### Editing / replacing an existing file
```bash
# State file marks it "done" → skipped on normal run
# Force full rebuild:
arivu-ingest --reset
```

### Best practices
- **Organize by folder** under `~/ai-knowledge-base/` (e.g. `guidewire/`, `java/`, `notes/`) — folder path becomes part of `source` metadata for future filtering
- **Batch additions** — drop several files, ingest once (fewer runs)
- **Verify before large runs** — ingest a small subset first, run test queries, confirm quality
- **Stop safely** — `Ctrl+C` after an `[ok]` line; resume skips completed files

### Memory tips (16GB)
- Ingest and query are separate — don't need Qwen loaded during ingest
- `on_disk=True` keeps vector RAM low
- Use Qwen2.5-Coder (lighter) for queries; avoid Qwen3 14B during heavy retrieval

---



### Required services for ingest
```bash
ollama-local        # BGE-M3 embedding
qdrant-start        # vector storage
# Open WebUI NOT required for ingest
```

### Health checks
```bash
curl http://localhost:11434/api/tags      # Ollama
curl http://localhost:6333/healthz         # Qdrant
```

### Storage location
- Docker volume: `qdrant_storage`
- Host: `/var/lib/docker/volumes/qdrant_storage/_data`
- Survives container restart

---

## Phase Log

### Phase 1 — Infrastructure ✅
- Ollama + 6 models (Qwen2.5-Coder, Qwen3-Coder, Qwen3 14B, Mistral Nemo, Llama 3.1, BGE-M3)
- Open WebUI (Docker, on-demand)
- Continue.dev wired to VS Code
- `.bashrc` optimized for 16GB

### Phase 2 — Knowledge Base / RAG 🔄
- Qdrant vector DB
- Ingestion pipeline (parse → chunk → embed → store)
- Query pipeline (embed → search → context → answer)
- Batch + resume + deterministic IDs + dedup
- **Status:** Ready to test with real documents

### Phase 3+ — Agents (Planned)
- Teacher, Coding, Research, Memory agents
- Will reference this doc for grounding
- LangGraph orchestration

---

## For Future Agents

This section will hold agent-specific grounding as agents are introduced.

- **Retrieval interface:** agents call the same `retrieve()` → top-K chunks
- **Shared collection:** `arivu_kb` — all agents query the same KB
- **Extension point:** metadata filtering (by source, type, phase) for scoped retrieval

*To be expanded per agent in Phase 3+.*

---

## Related

- [RAG Pipeline](rag-pipeline.md)
- [AI & Privacy — Arivu Stack](index.md)
