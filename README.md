# mephisto83.github.io

**Andrew Porter — Full-Stack Engineer & AI Platform Architect**

Personal portfolio and project showcase hosted on GitHub Pages at [mephisto83.github.io](https://mephisto83.github.io).

---

## Overview

A modern, animated portfolio site presenting **200+ production-ready projects** spanning AI/ML platforms, full-stack web applications, mobile apps, game engines, distributed systems, and developer tools. The site features a dark-themed design with GSAP scroll animations, a starfield canvas background, and a horizontally-scrollable project showcase that loads project data dynamically from JSON.

---

## Live Site Features

- **Animated hero section** with GSAP + ScrollTrigger text reveal and cursor-glow effect
- **Filterable project showcase** — horizontal card scroll with category filters (All, Full-Stack, ML, Frontend, Backend, Library, Tools, Infrastructure, Data)
- **Per-project documentation** — each project card can open a detailed markdown doc rendered in-page via Marked.js
- **Stats strip** displaying aggregate metrics (200+ projects, 30M+ lines of code, 50+ technologies, etc.)
- **Tech marquee** scrolling through key technologies
- **Responsive design** with mobile-friendly navigation and adaptive typography

---

## Repository Structure

```
├── index.html                  # Main portfolio site (single-page app)
├── data/
│   ├── projects.json           # All 200+ projects: metadata, tech stacks, bullets, scores
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
| `i`   | Impact score (1–8, used for sorting/badging) |
| `c`   | Category (`Full-Stack`, `ML`, `Frontend`, `Backend`, `Library`, `Tools`, `Infrastructure`, `Data`, `Other`) |
| `b`   | Array of detailed bullet points describing key accomplishments |
| `h`   | Array of highlight strings shown on the card |

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
| Full-Stack | 79 | End-to-end applications with frontend and backend |
| Backend | 33 | Server-side services, APIs, data pipelines |
| Frontend | 29 | Client-side applications, UI libraries |
| Tools | 23 | Developer tools, automation, CLI utilities |
| Library | 17 | Reusable packages and frameworks |
| Other | 8 | Miscellaneous and conceptual projects |
| ML | 6 | Machine learning models and training pipelines |
| Data | 3 | Dataset management and curation |
| Infrastructure | 2 | IaC and cloud provisioning |

---

## Notable Projects

| Project | Description | Stack |
|---------|-------------|-------|
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
