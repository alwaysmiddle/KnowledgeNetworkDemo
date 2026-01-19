import type { KnowledgeNode, KnowledgeEdge, Layer, LayoutMode } from '../types'

interface Props {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  layoutMode: LayoutMode
  layers: Layer[]
}

const nodeColors: Record<string, string> = {
  class: '#3b82f6',
  teacher: '#10b981',
  student: '#f59e0b',
  department: '#8b5cf6',
  default: '#6b7280',
}

export function GraphCanvas({ nodes, edges, layoutMode, layers }: Props) {
  if (layoutMode === 'tree-list') {
    return <TreeListView nodes={nodes} edges={edges} layers={layers} />
  }

  if (layoutMode === 'horizontal-tree') {
    return <HorizontalTreeView nodes={nodes} edges={edges} layers={layers} />
  }

  return <GraphView nodes={nodes} edges={edges} />
}

function GraphView({ nodes, edges }: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }) {
  // Simple force-directed-like positioning (placeholder - will add proper library later)
  const nodePositions = new Map<string, { x: number; y: number }>()
  const width = 800
  const height = 600
  const centerX = width / 2
  const centerY = height / 2

  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    const radius = Math.min(width, height) * 0.35
    nodePositions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  })

  return (
    <div className="h-full flex items-center justify-center bg-zinc-900">
      <svg width={width} height={height} className="border border-zinc-700 rounded-lg">
        {/* Edges */}
        {edges.map(edge => {
          const source = nodePositions.get(edge.source)
          const target = nodePositions.get(edge.target)
          if (!source || !target) return null

          return (
            <g key={edge.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#4b5563"
                strokeWidth={1}
              />
            </g>
          )
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const pos = nodePositions.get(node.id)
          if (!pos) return null
          const color = nodeColors[node.type] || nodeColors.default

          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={24}
                fill={color}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
              <text
                x={pos.x}
                y={pos.y + 40}
                textAnchor="middle"
                className="fill-zinc-300 text-xs"
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function TreeListView({ nodes, layers }: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; layers: Layer[] }) {
  if (layers.length === 0) {
    return (
      <div className="h-full p-4 overflow-auto">
        <div className="space-y-1">
          {nodes.map(node => (
            <div
              key={node.id}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: nodeColors[node.type] || nodeColors.default }}
              />
              <span>{node.label}</span>
              <span className="text-zinc-500 text-sm">({node.type})</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="space-y-4">
        {layers.map((layer, layerIndex) => (
          <div key={layer.id}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded text-sm">
                {layerIndex}
              </span>
              <span className="font-medium">{layer.name}</span>
            </div>
            <div className="ml-8 space-y-1">
              {layer.nodes.map(node => (
                <div
                  key={node.id}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: nodeColors[node.type] || nodeColors.default }}
                  />
                  <span>{node.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function HorizontalTreeView({ nodes, layers }: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[]; layers: Layer[] }) {
  if (layers.length === 0) {
    return (
      <div className="h-full p-4 overflow-auto">
        <div className="flex gap-4 flex-wrap">
          {nodes.map(node => (
            <div
              key={node.id}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: nodeColors[node.type] || nodeColors.default }}
              />
              <span>{node.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-4 overflow-auto">
      <div className="flex gap-8">
        {layers.map((layer, layerIndex) => (
          <div key={layer.id} className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-700">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-700 rounded text-sm">
                {layerIndex}
              </span>
              <span className="font-medium whitespace-nowrap">{layer.name}</span>
            </div>
            <div className="space-y-2">
              {layer.nodes.map(node => (
                <div
                  key={node.id}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded whitespace-nowrap"
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: nodeColors[node.type] || nodeColors.default }}
                  />
                  <span>{node.label}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
