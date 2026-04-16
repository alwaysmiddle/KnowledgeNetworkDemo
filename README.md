# Knowledge Graph Based Course Visualization

A thesis demo prototype for **knowledge graph based course visualization**, built as a professor-facing course management and authoring tool. The demo uses a Python 101 course domain to demonstrate six claims about knowledge graph visualization, OWL inference, and structural validation.

## Architecture

```
React (Vite)        :5173  — Frontend (ReactFlow graph canvas)
C# ASP.NET Core     :5000  — Backend API (Neo4j queries, Jena orchestration, pipeline caching)
Neo4j 5             :7474  — Graph database (property graph storage + Cypher queries)
Apache Jena Fuseki  :3030  — OWL inference engine (formal reasoning, derived properties)
Python FastAPI      :8001  — Embedding + clustering pipeline (EVōC + toponymy)
```

The frontend and C# backend run natively. Neo4j, Jena, and the Python pipeline run in Docker.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Getting Started

Start the infrastructure services:

```powershell
docker compose up -d
```

Start the frontend dev server:

```powershell
npm install
npm run dev
```

### Service Health Checks

| Service | Health endpoint |
|---------|----------------|
| Neo4j Browser | http://localhost:7474 |
| Jena Fuseki | http://localhost:3030 |
| Python Pipeline | http://localhost:8001/health |

## Project Structure

```
KnowledgeNetworkDemo/
├── src/                        # React + TypeScript frontend
│   ├── components/             # ReactFlow canvas, node/edge components
│   ├── data/                   # Domain data and layer configuration
│   ├── lib/                    # Core algorithms (layers, layout, traversal)
│   └── types.ts                # Shared type definitions
├── infrastructure/
│   ├── jena/                   # OWL ontology files (loaded at Fuseki startup)
│   └── pipeline/               # Python FastAPI service (embed → cluster → name)
├── docker-compose.yml          # Neo4j + Jena Fuseki + Python pipeline
└── .env                        # Service credentials (gitignored)
```

## Thesis Claims

This prototype demonstrates six claims about knowledge graph visualization:

1. **Typed node vocabulary** — 6 node types (Concept, Principle, Example, Assessment, Reference, Analogy) with distinct visual styles
2. **Derived properties** — OWL inference via Jena produces `assesses` edges from `applies_in` relationships
3. **Structural validation** — constraint checking ensures graph health before publishing
4. **Linear traversal** — prerequisite chain walking with gap detection
5. **Concept-Web traversal** — full relational neighborhood exploration
6. **Problem-First traversal** — backward prerequisite reachability from assessments

## Key Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19, TypeScript, [ReactFlow](https://reactflow.dev/), Tailwind CSS v4 | Interactive graph canvas |
| Backend | ASP.NET Core (.NET 8) | API layer, Neo4j queries, Jena orchestration |
| Graph DB | [Neo4j 5](https://neo4j.com/) | Property graph storage, Cypher traversal queries |
| Inference | [Apache Jena Fuseki](https://jena.apache.org/documentation/fuseki2/) | OWL reasoning (TransitiveProperty, SymmetricProperty, derived properties) |
| Clustering | [EVōC](https://github.com/TutteInstitute/evoc) | Multi-granularity embedding-based clustering |
| Embeddings | [nomic-embed-text-v1.5](https://huggingface.co/nomic-ai/nomic-embed-text-v1.5) | Local text embeddings (768-dim, Apache 2.0) |
| Layout | [ELK](https://www.eclipse.org/elk/), Dagre | Graph layout algorithms |

## Acknowledgments

### Tutte Institute for Mathematics and Computing

The clustering and visualization pipeline builds on open-source tools from the [Tutte Institute for Mathematics and Computing](https://github.com/TutteInstitute):

- **[EVōC](https://github.com/TutteInstitute/evoc)** (Embedding Vector Oriented Clustering) — multi-granularity clustering of embedding vectors. EVōC provides the primary spatial grouping for the WorldMap overview, producing hierarchical cluster layers that drive semantic zoom. Licensed under BSD-2-Clause.
- **[DataMapPlot](https://github.com/TutteInstitute/datamapplot)** — the compound graph rendering approach (GMap-style colored regions, cluster labels, semantic zoom) is inspired by DataMapPlot's approach to creating labeled cluster visualizations of data maps. Licensed under BSD-3-Clause.

### Visualization Research

The layered view architecture draws on established graph visualization research:

- **Vehlow, Behrisch, Beck, et al. (2017)** — *Visualizing Group Structures in Graphs: A Survey*. Taxonomy informing the three WorldMap rendering modes (disjoint hierarchical, disjoint flat, overlapping flat).
- **ZMLT (2019)** — *Multi-level tree based approach for interactive graph visualization with semantic zoom*. Compound graph semantic zoom model.
- **GMap** — *Visualizing Graphs and Clusters as Maps*. Colored region rendering for cluster groups.

## License

BSD-2-Clause — see [LICENSE](LICENSE).
