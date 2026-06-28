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
Local LLMs            ← Gemma / Qwen / DeepSeek (quantized)
```

**Why this stack:**

- **Ollama** — simple model management, REST API out of the box
- **Continue.dev** — VS Code plugin that replaces GitHub Copilot with a local model
- **Quantized models (Q4)** — run efficiently on 16GB RAM without a GPU

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

### 3. Local Models

```sh
# General assistant — fast, lightweight
ollama pull gemma:2b

# Coding assistant — best for code gen and refactoring
ollama pull qwen2.5-coder:7b

# Optional — deeper coding tasks
ollama pull deepseek-coder:6.7b

# Verify installed
ollama list
```

### 4. Continue.dev

- VS Code → Extensions → Search `Continue` → Install
- Config file: `~/.continue/config.json`
- Restart VS Code after configuring

### 5. Validate

```sh
curl http://localhost:11434/api/tags
```

---

## Model Selection Guide

| Model | Best For | When to Use |
|---|---|---|
| **Gemma 2B** | Fast prompts, docs, terminal help | Lightweight tasks, quick answers |
| **Qwen2.5-Coder 7B** | Code gen, refactoring, debugging | Main coding assistant |
| **DeepSeek Coder 6.7B** | Architecture assistance | Complex code tasks |

---

## Performance Optimization

!!! tip "Running efficiently on 16GB RAM"
    - Use **quantized models (Q4)** — significant RAM saving with minimal quality loss
    - Keep context window between **4K–8K tokens**
    - Run **one active model at a time**
    - Monitor memory: `htop` or `free -h`

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

- [GitHub — Local AI Dev Stack](https://github.com/Sakthi-S99/Local-AI-Driven-DevStack)
