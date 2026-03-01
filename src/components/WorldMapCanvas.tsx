import { useMemo } from 'react'
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react'
import type { Node, Edge, NodeMouseHandler } from '@xyflow/react'

import { KGNodeComponent } from './KGNode'
import type { KGNodeData } from './KGNode'
import { KGEdgeComponent } from './KGEdge'
import { layoutWorldMap } from '../lib/layoutWorldMap'
import type { KnowledgeGraph, ComputedLayer } from '../types'

// Stable references — must be outside component
const nodeTypes = { kgNode: KGNodeComponent }
const edgeTypes = { kgEdge: KGEdgeComponent }

const LAYER_BADGE_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-emerald-100 text-emerald-700 border-emerald-300',
  'bg-amber-100 text-amber-700 border-amber-300',
  'bg-violet-100 text-violet-700 border-violet-300',
  'bg-rose-100 text-rose-700 border-rose-300',
]

interface WorldMapCanvasProps {
  graph: KnowledgeGraph
  layers: ComputedLayer[]
  layerNames: string[]
  visibleNodeIds: Set<string>
  onNodeClick: (nodeId: string) => void
}

export function WorldMapCanvas({
  graph,
  layers,
  layerNames,
  visibleNodeIds,
  onNodeClick,
}: WorldMapCanvasProps) {
  const positionMap = useMemo(() => {
    const positions = layoutWorldMap(layers)
    return Object.fromEntries(positions.map(p => [p.id, p.position]))
  }, [layers])

  // Which nodes have outgoing drill-down edges (i.e. have children in next layer)
  const drillRelationships = useMemo(
    () => new Set(layers.flatMap(l => l.outgoingRelationships)),
    [layers]
  )
  const hasChildrenIds = useMemo(
    () => new Set(graph.edges.filter(e => drillRelationships.has(e.relationship)).map(e => e.source)),
    [graph.edges, drillRelationships]
  )

  // Build a nodeId→layerIndex map for coloring
  const nodeLayerIndex = useMemo(() => {
    const map: Record<string, number> = {}
    layers.forEach((layer, i) => layer.nodeIds.forEach(id => { map[id] = i }))
    return map
  }, [layers])

  const rfNodes: Node<KGNodeData>[] = useMemo(
    () =>
      graph.nodes
        .filter(n => nodeLayerIndex[n.id] !== undefined)
        .map(n => ({
          id: n.id,
          type: 'kgNode',
          position: positionMap[n.id] ?? { x: 0, y: 0 },
          data: {
            label: n.label,
            nodeType: n.type,
            hasChildren: hasChildrenIds.has(n.id),
            layerIndex: nodeLayerIndex[n.id],
            dimmed: visibleNodeIds.size > 0 && !visibleNodeIds.has(n.id),
          },
        })),
    [graph.nodes, positionMap, hasChildrenIds, nodeLayerIndex, visibleNodeIds]
  )

  const rfEdges: Edge[] = useMemo(
    () =>
      graph.edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'kgEdge',
        data: { relationship: e.relationship },
      })),
    [graph.edges]
  )

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    onNodeClick(node.id)
  }

  return (
    <div className="relative w-full h-full">
      {/* Layer legend — static overlay at top of pane */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex gap-2 pointer-events-none">
        {layerNames.map((name, i) => (
          <span
            key={name}
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${LAYER_BADGE_COLORS[i] ?? 'bg-slate-100 text-slate-600 border-slate-300'}`}
          >
            {name}
          </span>
        ))}
      </div>

      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.1}
        maxZoom={2}
        panOnScroll
        zoomOnScroll
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
      </ReactFlow>
    </div>
  )
}
