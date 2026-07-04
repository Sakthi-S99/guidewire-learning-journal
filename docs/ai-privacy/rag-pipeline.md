# Arivu RAG Pipeline — Reference Documentation (Phase 1–2)

**System:** Intel Core Ultra i7 · Intel Arc iGPU · 16GB RAM · Kubuntu
**Stack:** Ollama + BGE-M3 + Qdrant + Plain Python
**Status:** Phase 1 (Infrastructure) complete · Phase 2 (Knowledge Base/RAG) built, pending real-doc testing

---

## 1. Architecture

```
Local PDFs / Markdown (~/ai-knowledge-base, never committed to git)
        ↓
┌─────────────── INGESTION (ingest.py) ───────────────┐
│  Extract → Chunk → Embed → Store                     │
└────────────────────────────────────────────────────┘
        ↓
   Qdrant (collection: arivu_kb, 1024-dim, Cosine)
        ↓
┌─────────────── QUERY (ask.py) ───────────────────────┐
│  Embed question → Search top-K → Build context →      │
│  Prompt LLM → Answer (context-grounded)                │
└────────────────────────────────────────────────────┘
```

Project layout:
```
~/arivu-rag/
├── config/settings.py     ← single source of truth for all params
├── ingestion/ingest.py    ← parse → chunk → embed → store
├── query/ask.py           ← embed → search → context → generate
└── setup-qdrant.sh        ← Docker, on-demand (--restart=no)
```

---

## 2. Glossary — Keywords & Definitions

| Term | Definition |
|---|---|
| **RAG (Retrieval-Augmented Generation)** | Pattern where an LLM's answer is grounded by injecting relevant retrieved text into the prompt, instead of relying purely on the model's trained knowledge. Reduces hallucination, allows private/local data to inform answers without fine-tuning. |
| **Embedding** | A fixed-length numeric vector (1024 floats for BGE-M3) that represents the *meaning* of a piece of text. Similar meanings → vectors that sit close together in vector space. |
| **Vector DB** | A database optimized to store embeddings and answer "find me the N closest vectors to this one" queries fast, at scale. Qdrant is this layer here. |
| **Qdrant** | The vector DB used. Runs as a Docker container, stores vectors + arbitrary JSON metadata ("payload") per point, exposes REST/gRPC + a `qdrant-client` Python SDK. |
| **Collection** | Qdrant's equivalent of a table — a named group of vectors sharing the same dimensionality and distance metric. Here: `arivu_kb`. |
| **Point** | A single stored unit in Qdrant = `{id, vector, payload}`. One point = one text chunk. IDs are UUIDs so re-ingestion never collides. |
| **Distance Metric (Cosine)** | How "closeness" between two vectors is measured. Cosine similarity measures the angle between vectors, not magnitude — standard choice for normalized text embeddings. |
| **Chunking** | Splitting a long document into smaller pieces before embedding, because (a) embedding models have input limits and (b) retrieval precision improves when each chunk is topically narrow. |
| **Fixed-size chunking (chosen)** | Splits text into chunks of ~N tokens with a fixed overlap, regardless of document structure. Simple, predictable, cheap to compute. Current config: `CHUNK_SIZE=700`, `CHUNK_OVERLAP=100`. |
| **Semantic/structure-aware chunking (not used yet)** | Splits along natural boundaries (headers, paragraphs) instead of raw token counts. Better context integrity, more complex, format-dependent. Deferred until fixed-size proves insufficient. |
| **Overlap** | Tokens repeated between consecutive chunks so a concept split across a chunk boundary still appears whole in at least one chunk. |
| **Token vs Word approximation** | A token is a model's sub-word unit; this pipeline approximates using word counts (~1.3 words ≈ 1 token) to avoid pulling in a heavy tokenizer library — a deliberate tradeoff for a 16GB-RAM local box. |
| **BGE-M3** | The embedding model (via Ollama) that turns each chunk (and each query) into a 1024-dim vector. Already installed as part of Phase 1. |
| **Top-K retrieval** | At query time, Qdrant returns the K most similar chunks to the question's embedding. Current `TOP_K=5`. |
| **Context injection** | Concatenating retrieved chunks (with source labels) into the LLM prompt, so generation is constrained to what was retrieved. |
| **Context-only prompting / grounding** | Instructing the LLM explicitly to answer *only* from supplied context and say so if the answer isn't present — the main hallucination-mitigation lever in this design. |
| **Ingestion pipeline** | The offline/batch process: read files → chunk → embed → upsert into Qdrant. Run via `arivu-ingest` (`--reset` rebuilds the collection). |
| **Query pipeline** | The online/interactive process: embed a question → search → build context → call LLM → return answer with cited sources. Run via `arivu-ask`. |
| **Reranking** *(not yet implemented)* | A second-pass model that re-scores the top-K retrieved chunks for relevance before they're sent to the LLM — improves precision beyond raw vector similarity. |
| **Hybrid search** *(not yet implemented)* | Combining vector similarity with keyword/BM25 search, useful for exact-term queries (error codes, ticket IDs) that pure semantic search can miss. |
| **Metadata filtering** *(not yet implemented)* | Restricting Qdrant search to points matching payload conditions, e.g. `source == "billing-center"`, before/alongside vector search. |

---

## 3. Logic Behind the Scenes

### Ingestion (`ingest.py`)
1. **Extract** — `pypdf` for PDFs, direct read for `.md`/`.txt`. Unsupported types are skipped, not errored.
2. **Chunk** — word-based fixed-size splitting with overlap; a lightweight, dependency-free approximation of token-based chunking.
3. **Embed** — each chunk is POSTed individually to Ollama's `/api/embeddings` endpoint with `bge-m3:latest`.
4. **Store** — each embedding is upserted into Qdrant as a `PointStruct` with a UUID and payload `{source, chunk_index, text}`. `--reset` drops and recreates the collection for a clean rebuild.

### Query (`ask.py`)
1. **Embed** the incoming question with the same BGE-M3 model (embedding symmetry between corpus and query is required for meaningful similarity).
2. **Search** Qdrant for the top-5 nearest points by cosine distance.
3. **Build context** by concatenating each hit's `text`, labeled with its `source`, separated by `---`.
4. **Generate** — the context and question are wrapped in a strict prompt template (*"Answer using ONLY the context below… if not present, say so"*) and sent to `qwen3-coder` (or `qwen3`) via `/api/generate`.
5. **Answer** is returned; sources are available for citation display.

### Why these specific design choices
- **Plain Python over LangChain/LlamaIndex** — deliberate: the goal was hands-on understanding of every step, and heavy frameworks abstract away exactly what was meant to be learned. Also avoids dependency bloat on a 16GB machine.
- **Word-approx chunking over a real tokenizer** — keeps ingestion light; a real tokenizer (e.g. `tiktoken`) is a candidate upgrade once accuracy matters more than simplicity.
- **UUID point IDs** — makes re-ingestion idempotent-safe; no accidental overwrites from colliding sequential IDs.
- **Local-only PDFs** — `~/ai-knowledge-base` is explicitly excluded from git; only pipeline code, config, and findings are published to the learning journal.

---

## 4. System Configuration Considerations

Every decision above is shaped by the constraint of a **16GB RAM, Intel Arc iGPU (no CUDA), single-model-at-a-time** setup:

- `OLLAMA_MAX_LOADED_MODELS=1` and `OLLAMA_NUM_PARALLEL=1` mean the embedding model and the generation model are never resident simultaneously by design — ingestion (embedding-heavy) and querying (generation-heavy) are naturally separated phases, which fits this constraint well.
- Qdrant runs with `--restart=no` — on-demand only, not a background service, consistent with the rest of the stack's philosophy.
- Avoiding LangChain/LlamaIndex also avoids their transitive dependency weight, which matters more on constrained RAM than on a workstation.
- Intel Arc has no CUDA path; any future GPU acceleration would need to go through Intel's oneAPI/SYCL or Vulkan compute backends — currently out of scope, everything runs on CPU via Ollama.

---

## 5. Current Limitations

- Retrieval quality is **untested against real documents** — findings table in the working notes is still "pending" across all rows.
- No reranking — raw top-K cosine hits go straight to the LLM; noisy or partially-relevant chunks aren't filtered further.
- No metadata filtering — can't yet scope a query to "only BillingCenter docs" etc.
- No hybrid/keyword search — exact strings (error codes, class names) rely entirely on semantic similarity, which can under-perform for these.
- No evaluation harness — no repeatable way to measure retrieval precision/recall or answer quality across chunking/Top-K changes.
- No incremental ingestion — `--reset` rebuilds the whole collection; there's no diff-based re-ingestion of only changed files.

---

## 6. Future Improvement Roadmap

**Near-term (tune current pipeline):**
- Run real BillingCenter PDFs/MD through it; populate the findings table (chunk size, Top-K, retrieval quality) with actual observations.
- Add metadata filtering (`source`, `doc_type`) to Qdrant queries for scoped retrieval.
- Add a lightweight reranker pass (e.g. cross-encoder via Ollama or a small local model) before context is built.
- Swap word-approx chunking for a real tokenizer if boundary errors show up in testing.

**Mid-term (Phase 2 hardening → Phase 3+ readiness):**
- Introduce hybrid search (BM25 + vector) for exact-term recall.
- Incremental ingestion — hash-based change detection so `arivu-ingest` only re-embeds modified files.
- Basic evaluation harness — a fixed question set with expected sources, run after every pipeline change to catch regressions.
- PostgreSQL layer (already in the target stack) for chat history / structured metadata, separating "what was asked" from "what was retrieved."

**Longer-term (per the phase roadmap already set):**
- Phase 7 — layer LangGraph orchestration on top of these proven internals, now that the fundamentals are understood firsthand.
- Phase 8 — Neo4j knowledge graph, once concept-relationship queries (not just similarity) become necessary — explicitly deferred until then.
- Explore Intel Arc acceleration (oneAPI/SYCL) if embedding/generation latency becomes a bottleneck as the corpus grows.

---

## 7. Operational Reference

```bash
# Start Qdrant (on-demand)
bash setup-qdrant.sh

# Ingest documents
arivu-ingest              # add/update
arivu-ingest --reset      # full rebuild

# Query
arivu-ask "How does delinquency cancellation work in BillingCenter?"
arivu-ask                 # interactive mode
```

Key config levers (`config/settings.py`): `CHUNK_SIZE`, `CHUNK_OVERLAP`, `TOP_K`, `COLLECTION`, `EMBED_MODEL`, `LLM_MODEL`.
