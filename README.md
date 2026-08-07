# mephisto83.github.io

**Andrew Porter — Staff Software Engineer & AI Platform Architect**

Personal portfolio and project showcase hosted on GitHub Pages at [mephisto83.github.io](https://mephisto83.github.io).

---

## Overview

A modern, animated portfolio site presenting **250+ projects** spanning agent platforms, enterprise SaaS, distributed systems, developer tooling, ML infrastructure, mobile apps, and game engines — including recent governed agentic-AI and insurance-automation work at Zachary Companies. The site features a dark-themed design with GSAP scroll animations, a starfield canvas background, and a horizontally-scrollable project showcase that loads project data dynamically from JSON.

The positioning is deliberately platform-first: the narrative leads with agent runtime, governed actions, evaluation, observability, systems-of-record integration, and software distribution — not with a generic full-stack summary.

---

## Live Site Features

- **Animated hero section** with GSAP + ScrollTrigger text reveal and cursor-glow effect
- **Agent Platform Engineering section** (`#platform`) — nine capability cards covering agent runtime and durable workflows, governed actions and approvals, evaluation harnesses, reliability tiers, run observability, systems-of-record integration, software distribution, multi-tenant foundations, and compliance-sensitive automation
- **Filterable project showcase** — horizontal card scroll with category filters (All, Zachary Companies, Full-Stack, ML, Frontend, Backend, Library, Tools, Infrastructure, Data)
- **Per-project documentation** — each project card can open a detailed markdown doc rendered in-page via Marked.js
- **Stats strip** displaying aggregate metrics (19 years engineering, 250+ projects, 59 AI platform repos, 4 countries)
- **Tech marquee** scrolling through key technologies
- **Responsive design** with mobile-friendly navigation and adaptive typography

---

## Repository Structure

```
├── index.html                  # Main portfolio site (single-page app)
├── data/
│   ├── projects.json           # All 250+ projects: metadata, tech stacks, bullets, scores
│   ├── summary.json            # Aggregated summary, skills matrix, top projects, category counts
│   └── docs/                   # Per-project markdown documentation (180+ .md files)
│       ├── woodbury.md
│       ├── story-gen.md
│       ├── flow-midjourney.md
│       └── ...
├── images/
│   └── repos/                  # Project card images (.jpg, .png, .webp per project)
│       ├── repo-woodbury.webp
│       ├── repo-story-gen.webp
│       └── ...
├── composer-companion-ss/      # Composer Companion music platform (deployed sub-app)
│   ├── index.html
│   ├── js/                     # Instrument modules, MIDI, audio helpers
│   ├── Data/                   # Music data, chord definitions, voices
│   ├── Midi/                   # MIDI library
│   ├── plugins/                # Bootstrap, chart.js, datatables, etc.
│   ├── score-library/          # Music notation rendering
│   └── ...
├── aframe_test/                # A-Frame WebVR test page
├── meph/                       # MEPH JavaScript MVC/MVVM framework source
│   ├── src/                    # Framework source code
│   ├── specs/                  # Test specifications
│   ├── extensions/             # Framework extensions
│   └── polyfills/              # Browser polyfills
├── dev-harness/                # Development prototypes & examples
│   ├── login-example/
│   ├── meph-mobile-example/
│   ├── nection-prototype/
│   └── presentation-blender/
├── signin/                     # Authentication pages
├── testing/                    # Jasmine test runner
├── guides.json                 # MEPH framework guide definitions
├── build.bat                   # Build script
├── build_doc.bat               # Documentation build script
└── README.md
```

---

## Project Data

### projects.json

Each entry in `data/projects.json` contains:

| Field | Description |
|-------|-------------|
| `r`   | Repository name (GitHub repo slug) |
| `t`   | Project title |
| `o`   | One-line overview / description |
| `s`   | Array of technologies used |
| `i`   | Impact score (1–9, used for sorting/badging) |
| `c`   | Category (`Full-Stack`, `ML`, `Frontend`, `Backend`, `Library`, `Tools`, `Infrastructure`, `Data`, `Other`) |
| `b`   | Array of detailed bullet points describing key accomplishments |
| `h`   | Array of highlight strings shown on the card |
| `g`   | GitHub owner/org for the repo link (e.g. `Zachary-Companies`); defaults to `mephisto83` |
| `v`   | Visibility flag — `private` suppresses the GitHub link and the entry uses a synthetic slug |

### summary.json

Contains:
- `overallSummary` — bio paragraph
- `recommendedBullets` — top-level resume bullets
- `skillsMatrix` — technologies grouped by category
- `topProjects` — expanded detail for the highest-impact projects
- `categoryCounts` — project counts per category

### docs/

Markdown files named `{repo-name}.md` providing in-depth write-ups for each project. These are fetched and rendered client-side using [Marked.js](https://github.com/markedjs/marked) when a user clicks into a project card.

---

## Technology Highlights

The portfolio showcases work across a broad technology landscape:

| Domain | Key Technologies |
|--------|-----------------|
| **Languages** | TypeScript, Python, JavaScript, C#, C++, Java, Objective-C, Swift |
| **Frontend** | React, React Native, Next.js, A-Frame, Three.js, Electron, Expo |
| **Backend** | Node.js, Express.js, ASP.NET Core, Flask, Django, Spring Boot |
| **AI / ML** | PyTorch, TensorFlow, ONNX, YOLO, LangChain, FAISS, Hugging Face, OpenAI API |
| **Cloud** | Firebase, Google Cloud Platform, AWS, Azure, Docker, Terraform |
| **Real-Time** | WebRTC, WebSocket, Socket.IO, SignalR, Firebase Realtime Database |
| **3D / XR** | Three.js, React Three Fiber, A-Frame, WebXR, Unreal Engine 4, Blender Python API |
| **Data** | Firestore, MongoDB, FAISS, SQLite, Redis |
| **DevOps** | Docker, GitHub Actions, Webpack, Vite, ESBuild |

---

## Project Categories

| Category | Count | Description |
|----------|-------|-------------|
| Full-Stack | 92 | End-to-end applications with frontend and backend |
| Backend | 58 | Server-side services, APIs, data pipelines |
| Tools | 31 | Developer tools, automation, CLI utilities |
| Frontend | 29 | Client-side applications, UI libraries |
| Library | 27 | Reusable packages and frameworks |
| Other | 8 | Miscellaneous and conceptual projects |
| ML | 6 | Machine learning models and training pipelines |
| Infrastructure | 6 | IaC and cloud provisioning |
| Data | 5 | Dataset management and curation |

> 62 of these are recent **Zachary Companies** projects (filterable via the dedicated chip). See below.

---

## Notable Projects

| Project | Description | Stack |
|---------|-------------|-------|
| **Agentic Commerce Platform** | Governed MCP gateway, scoped task grants, durable workflow runtime, approval inbox, evidence ledger | TypeScript, MCP, Aurora PostgreSQL, Lambda, Fargate |
| **Eval Forge** | Eval-driven LLM solver optimization — case generation, skill discovery, config sweeps, typed package codegen | TypeScript, Node.js, Docker |
| **Agentic Loop** | Multi-provider agent runtime with a ReAct loop over 35+ tools | TypeScript, Claude/OpenAI/Groq, Node.js |
| **Digital Assistant (Wanda)** | Distributed multi-agent enterprise assistant with LUIS intent routing (48K+ LOC C#) | C#, Bot Framework, Azure Service Fabric, LUIS |
| **Woodbury** | AI-powered dev platform with 14-tool CLI and real-time pipeline dashboard | TypeScript, Next.js, Firebase, WebSocket |
| **Story-Gen** | Multimedia content platform with GPU fallback (H100→CPU) | TypeScript, Python, Google Cloud Run, Docker |
| **Flow-Midjourney** | Computer vision workflow platform with YOLO training | Node.js, PyTorch, Docker, GCP |
| **Threefold Bastion** | 3D tower defense game with i18n (7.6M+ LOC) | React Three Fiber, TypeScript, Zustand |
| **ExpressiveFeeling** | Emotional wellness platform (1M+ LOC) | React Native, React, Firebase Functions |
| **Rapstar** | AI rap generation with custom transformer networks | Python, PyTorch, Node.js, Socket.io |
| **RedQuick Builder** | Visual RAD platform generating code for 5+ frameworks | TypeScript, React, Electron, Node.js |
| **ComposerCompanion** | AI music composition with TensorFlow.js & MIDI | React, Redux, TensorFlow.js, Firebase |
| **MEPH** | 560K+ LOC JavaScript MVC/MVVM framework | JavaScript, Express.js, SignalR |
| **Redhash** | Hashgraph consensus algorithm implementation | JavaScript, React, Redux, D3.js |

---

## Zachary Companies (2026)

Recent work at Zachary Companies appears as sanitized project cards, filterable via the **Zachary Companies** chip. Because this is a public site, private repositories are represented with capability-focused descriptions only — no client/vendor names, account identifiers, or internal domains — use synthetic slugs, and omit GitHub links. Themes:

- **Agentic-AI infrastructure** — a multi-provider tool-calling framework, an eval-driven LLM solver-optimization platform, a multi-tenant agent dashboard, and an AI code-generation platform
- **Governed agent platform** — a two-layer MCP surface (open public discovery + a task-grant-protected tenant action gateway), a durable workflow runtime with approval inboxes, an append-only evidence ledger, metered agentic work units, and versioned capability packs pinned into immutable tenant profiles
- **Insurance workflow automation** — a multi-tenant agency-management API + web app and a serverless email-processing pipeline feeding ~16 document, claims, and servicing agents, plus a long-running Fargate agent harness with budgets and audit trails
- **Local GPU inference** — LAN-accessible Ollama and ComfyUI/Whisper inference services for private, on-network model serving
- **Local-commerce product family** — an MCP-readable business platform, a mobile consumer buying agent, a discovery/enrichment platform, a field-agent onboarding and selling gate, an agentic market simulator, and an automated form-filling SaaS

---

## Local Development

The site is a static single-page application with no build step required for the main portfolio.

```bash
# Clone
git clone https://github.com/mephisto83/mephisto83.github.io.git
cd mephisto83.github.io

# Serve locally (any static server works)
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000` (or the port shown by your server).

### Updating Projects

1. Add/edit entries in `data/projects.json`
2. Update `data/summary.json` if aggregate stats change
3. Add a corresponding `data/docs/{repo-name}.md` for detailed documentation
4. Add project images to `images/repos/` (`.webp`, `.png`, `.jpg` variants)
5. Commit and push — GitHub Pages deploys automatically from the `master` branch

---

## Deployment

The site is deployed via **GitHub Pages** from the `master` branch. Any push to `master` triggers an automatic deployment to [https://mephisto83.github.io](https://mephisto83.github.io).

---

## License

This repository serves as a personal portfolio. Individual projects referenced here have their own repositories and licenses.
