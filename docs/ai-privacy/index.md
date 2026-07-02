# AI & Privacy

> Building a private, offline-capable AI coding and productivity environment — no cloud dependency, no data leaks.

---

## Philosophy

Most AI coding tools require sending your code to external servers. For enterprise development — especially in regulated industries like insurance — that's a non-starter. This section documents my personal local AI stack: fully offline, private, and optimized for a resource-constrained laptop.

---

## Hardware Profile

| Component | Spec |
|---|---|
| **CPU** | Intel Core Ultra i7 |
| **GPU** | Intel Arc (integrated) |
| **RAM** | 16GB |
| **Storage** | SSD |
| **OS** | Kubuntu (Linux) |

**Constraints:** No dedicated GPU, limited RAM — all model choices are optimized around this.

---

## Stack Architecture

```
VS Code
   │
Continue.dev          ← AI coding assistant (IDE plugin)
   │
Ollama                ← Local LLM runtime
   │
┌──────────────────────────────────────────┐
│  Qwen2.5-Coder   → coding (primary)      │
│  Qwen3 14B       → reasoning             │
│  Mistral Nemo    → docs & explanations   │
│  Llama 3.1 8B    → backup chat           │
│  BGE-M3          → embeddings / RAG      │
└──────────────────────────────────────────┘
```

**Why this stack:**

- **Ollama** — simple model management, REST API out of the box
- **Continue.dev** — replaces GitHub Copilot with fully local models
- **Role-separated models** — right model for the right task, not one model for everything
- **BGE-M3** — enables semantic codebase search and RAG without cloud indexing

---

## Setup

### 1. Visual Studio Code

```sh
sudo snap install code --classic
```

### 2. Ollama

```sh
curl -fsSL https://ollama.com/install.sh | sh

# Verify
ollama --version

# Start service
ollama serve
# Default endpoint: http://localhost:11434
```

### 3. Pull Models

```sh
ollama pull qwen2.5-coder:latest   # primary coding
ollama pull qwen3:14b              # reasoning
ollama pull mistral-nemo:latest    # docs & explanations
ollama pull llama3.1:8b            # backup
ollama pull bge-m3:latest          # embeddings

# Verify
ollama list
```

### 4. Continue.dev

- VS Code → Extensions → Search `Continue` → Install
- Config file: `~/.continue/config.yaml`
- Restart VS Code after configuring

### 5. Continue.dev Config (`~/.continue/config.yaml`)

```yaml
name: Local Config
version: 1.1.0
schema: v1

defaultCompletionOptions:
  contextLength: 4096
  temperature: 0.2

models:
  # Primary coding model — chat, edit, apply, autocomplete
  - name: Qwen2.5-Coder
    provider: ollama
    model: qwen2.5-coder:latest
    roles:
      - chat
      - edit
      - apply
      - autocomplete

  # General reasoning
  - name: Qwen3
    provider: ollama
    model: qwen3:14b
    roles:
      - chat

  # Documentation & explanations
  - name: Mistral Nemo
    provider: ollama
    model: mistral-nemo:latest
    roles:
      - chat

  # Backup chat model
  - name: Llama 3.1
    provider: ollama
    model: llama3.1:8b
    roles:
      - chat

  # Embedding model — RAG, codebase indexing, semantic search
  - name: BGE-M3
    provider: ollama
    model: bge-m3:latest
    roles:
      - embed
```

### 6. Validate

```sh
curl http://localhost:11434/api/tags
```

---

## Model Selection Guide

| Model | Role | Best For |
|---|---|---|
| **Qwen2.5-Coder** | Coding (primary) | Code gen, refactoring, debugging, autocomplete |
| **Qwen3 14B** | Reasoning | Architecture decisions, complex analysis |
| **Mistral Nemo** | Documentation | Write-ups, explanations, RCA drafts |
| **Llama 3.1 8B** | Backup | General chat when other models are loaded |
| **BGE-M3** | Embeddings | Codebase indexing, semantic search, RAG |

---

## Performance Optimization

!!! tip "Running efficiently on 16GB RAM"
    - Use **quantized models (Q4)** — significant RAM saving with minimal quality loss
    - Context window set to **4096 tokens** in config — balanced for RAM constraints
    - Temperature at **0.2** — low randomness suits code generation
    - Run **one active model at a time** — Qwen3 14B and Qwen2.5-Coder together will strain 16GB
    - Monitor memory: `htop` or `free -h`
    - **Qwen3 14B** is the heaviest — close other apps before loading it

---

## Troubleshooting

**Continue.dev can't detect Ollama:**
```sh
curl http://localhost:11434/api/tags
# If no response, run: ollama serve
```

**Performance is slow:**
- Lower the context window in `config.json`
- Switch to Gemma 2B instead of larger models
- Close heavy applications before running inference

**System freezes:**
- Check RAM: `free -h`
- Increase swap space
- Use Gemma over larger models
- Reduce project indexing in Continue settings

---

## Future Roadmap

- [ ] Upgrade to 32GB RAM
- [ ] Larger NVMe SSD
- [ ] Dedicated GPU workstation
- [ ] Local RAG integration (index codebase locally)
- [ ] Multi-agent orchestration
- [ ] Voice + automation layers

---

## Key Benefits

| Benefit | Detail |
|---|---|
| **Privacy** | No mandatory cloud dependency — code never leaves the machine |
| **Cost** | No recurring subscription |
| **Performance** | Optimized for available hardware with quantized models |
| **Scalability** | Modular — swap models or add layers without rebuilding the stack |

---

## Related

- [GitHub — Local AI Dev Stack](https://github.com/Sakthi-S99) ← *link your repo here*
