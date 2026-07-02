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

## Open WebUI — Local Chat Interface

Browser-based UI for interacting with Ollama models — similar to ChatGPT but fully local.

**Image:** `ghcr.io/open-webui/open-webui:ollama`  
**Access:** `http://localhost:3000`  
**Restart policy:** `no` — starts only on demand

### On-Demand Control

```bash
webui-start    # start the container
webui-stop     # stop when done
webui-status   # check if running
```

### Initial Setup

```bash
# First-time run (already done — for reference)
docker run -d \
  --name open-webui \
  --restart=no \
  -p 3000:8080 \
  -v open-webui:/app/backend/data \
  --add-host=host.docker.internal:host-gateway \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  ghcr.io/open-webui/open-webui:ollama

# Fix restart policy if needed
docker update --restart=no open-webui
```

!!! tip "Workflow"
    Start Ollama first (`ollama-local`), then Open WebUI (`webui-start`).
    Stop both when done to free RAM.

---

## `.bashrc` Configuration

Full optimized Ollama + WebUI block for `~/.bashrc`:

```bash
# ─── Ollama Local AI — Intel Core Ultra i7 + Arc + 16GB ──────────────────────

# Single inference — prevents RAM spikes
export OLLAMA_NUM_PARALLEL=1

# One model in memory at a time — essential for 16GB
export OLLAMA_MAX_LOADED_MODELS=1

# Keep model warm for 15min — prevents mid-session reloads
export OLLAMA_KEEP_ALIVE=15m

# Flash Attention — Intel Arc supports it, reduces memory per token
export OLLAMA_FLASH_ATTENTION=1

# Allow Continue.dev and local browser clients
export OLLAMA_ORIGINS="*"

# Ollama service
alias ollama-local='ollama serve'

# Quick model launch
alias ai-code='ollama run qwen2.5-coder:latest'
alias ai-think='ollama run qwen3:14b'
alias ai-docs='ollama run mistral-nemo:latest'

# Open WebUI — on-demand only
alias webui-start='docker start open-webui'
alias webui-stop='docker stop open-webui'
alias webui-status='docker ps --filter name=open-webui'
```

Apply changes:
```bash
source ~/.bashrc
```

---

## Troubleshooting

**Continue.dev can't detect Ollama:**
```sh
curl http://localhost:11434/api/tags
# If no response: ollama-local
```

**Open WebUI not loading:**
```sh
webui-status   # check if container is running
webui-start    # start if stopped
# Ensure Ollama is running first
```

**Performance is slow:**
- Switch to a lighter model (`ai-code` instead of `ai-think`)
- Lower `contextLength` in `config.yaml` (try 2048)
- Close heavy applications before inference

**System freezes:**
- Check RAM: `free -h`
- Qwen3 14B is the likely cause — switch to `qwen2.5-coder` or `mistral-nemo`
- Increase swap space if RAM is consistently full

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
