import { useState } from 'react'
import type { KnowledgeGraph, Layer, LayoutMode, TreeNode } from '../types'

interface Props {
  graph: KnowledgeGraph
  layers: Layer[]
  tree: TreeNode[]
  layoutMode: LayoutMode
  currentLayerPath: string[]
  onDrillDown: (layerId: string) => void
  onDrillUp: () => void
}

const nodeColors: Record<string, string> = {
  class: '#3b82f6',
  teacher: '#10b981',
  student: '#f59e0b',
  department: '#8b5cf6',
  layer: '#6366f1',
  default: '#6b7280',
}

export function GraphCanvas({ graph, layers, tree, layoutMode, currentLayerPath, onDrillDown, onDrillUp }: Props) {
  if (layoutMode === 'home') {
    return <HomeView graph={graph} />
  }

  if (layoutMode === 'tree-list') {
    return <TreeListView tree={tree} />
  }

  if (layoutMode === 'horizontal-tree') {
    return <HorizontalTreeView tree={tree} />
  }

  // Graph view with drill-down
  return (
    <DrillDownGraphView
      layers={layers}
      currentLayerPath={currentLayerPath}
      onDrillDown={onDrillDown}
      onDrillUp={onDrillUp}
    />
  )
}

function HomeView({ graph }: { graph: KnowledgeGraph }) {
  const { nodes, edges } = graph
  const width = 900
  const height = 600
  const centerX = width / 2
  const centerY = height / 2

  const nodePositions = new Map<string, { x: number; y: number }>()
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    const radius = Math.min(width, height) * 0.38
    nodePositions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-zinc-800 border-b border-zinc-700">
        <span className="text-sm text-zinc-400">Home View</span>
        <span className="mx-2 text-zinc-600">•</span>
        <span className="text-sm">{nodes.length} nodes, {edges.length} edges</span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-zinc-900 overflow-auto">
        <svg width={width} height={height}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4b5563" />
            </marker>
          </defs>

          {edges.map(edge => {
            const source = nodePositions.get(edge.source)
            const target = nodePositions.get(edge.target)
            if (!source || !target) return null

            const midX = (source.x + target.x) / 2
            const midY = (source.y + target.y) / 2

            return (
              <g key={edge.id}>
                <line
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#4b5563"
                  strokeWidth={1}
                  markerEnd="url(#arrowhead)"
                />
                <text
                  x={midX}
                  y={midY - 5}
                  textAnchor="middle"
                  className="fill-zinc-500 text-[10px]"
                >
                  {edge.relationship}
                </text>
              </g>
            )
          })}

          {nodes.map(node => {
            const pos = nodePositions.get(node.id)
            if (!pos) return null
            const color = nodeColors[node.type] || nodeColors.default

            return (
              <g key={node.id} className="cursor-pointer">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={20}
                  fill={color}
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={pos.x}
                  y={pos.y + 35}
                  textAnchor="middle"
                  className="fill-zinc-300 text-xs"
                >
                  {node.label}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 4}
                  textAnchor="middle"
                  className="fill-white text-[10px] font-medium pointer-events-none"
                >
                  {node.type.charAt(0).toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function DrillDownGraphView({
  layers,
  currentLayerPath,
  onDrillDown,
  onDrillUp,
}: {
  layers: Layer[]
  currentLayerPath: string[]
  onDrillDown: (layerId: string) => void
  onDrillUp: () => void
}) {
  const width = 900
  const height = 600

  if (currentLayerPath.length === 0) {
    const layerNodes = layers.map((layer, index) => ({
      id: layer.id,
      label: layer.name,
      nodeCount: layer.nodes.length,
      x: 150 + (index % 3) * 280,
      y: 150 + Math.floor(index / 3) * 200,
    }))

    return (
      <div className="h-full flex flex-col">
        <div className="p-3 bg-zinc-800 border-b border-zinc-700">
          <span className="text-sm text-zinc-400">Graph View</span>
          <span className="mx-2 text-zinc-600">•</span>
          <span className="text-sm">Click a layer to drill down</span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-zinc-900 overflow-auto">
          <svg width={width} height={height}>
            {layerNodes.map(layer => (
              <g
                key={layer.id}
                className="cursor-pointer"
                onClick={() => onDrillDown(layer.id)}
              >
                <rect
                  x={layer.x - 100}
                  y={layer.y - 50}
                  width={200}
                  height={100}
                  rx={8}
                  fill={nodeColors.layer}
                  className="hover:opacity-80 transition-opacity"
                />
                <text
                  x={layer.x}
                  y={layer.y - 10}
                  textAnchor="middle"
                  className="fill-white font-medium"
                >
                  {layer.label}
                </text>
                <text
                  x={layer.x}
                  y={layer.y + 15}
                  textAnchor="middle"
                  className="fill-zinc-300 text-sm"
                >
                  {layer.nodeCount} nodes
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    )
  }

  const currentLayerId = currentLayerPath[currentLayerPath.length - 1]
  const currentLayer = layers.find(l => l.id === currentLayerId)

  if (!currentLayer) return null

  const nodes = currentLayer.nodes
  const centerX = width / 2
  const centerY = height / 2

  const nodePositions = new Map<string, { x: number; y: number }>()
  nodes.forEach((node, index) => {
    const angle = (2 * Math.PI * index) / nodes.length
    const radius = Math.min(width, height) * 0.3
    nodePositions.set(node.id, {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    })
  })

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-zinc-800 border-b border-zinc-700 flex items-center gap-3">
        <button
          onClick={onDrillUp}
          className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <span className="text-zinc-600">•</span>
        <span className="text-sm">{currentLayer.name}</span>
        <span className="text-sm text-zinc-500">({nodes.length} nodes)</span>
      </div>
      <div className="flex-1 flex items-center justify-center bg-zinc-900 overflow-auto">
        <svg width={width} height={height}>
          {currentLayer.edges.map(edge => {
            const source = nodePositions.get(edge.source)
            const target = nodePositions.get(edge.target)
            if (!source || !target) return null

            return (
              <line
                key={edge.id}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="#4b5563"
                strokeWidth={1}
              />
            )
          })}

          {nodes.map(node => {
            const pos = nodePositions.get(node.id)
            if (!pos) return null
            const color = nodeColors[node.type] || nodeColors.default

            return (
              <g key={node.id} className="cursor-pointer">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={24}
                  fill={color}
                  className="hover:opacity-80 transition-opacity"
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
    </div>
  )
}

function TreeListView({ tree }: { tree: TreeNode[] }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedNodes(next)
  }

  const countDescendants = (node: TreeNode): number => {
    return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0)
  }

  const renderTreeNode = (treeNode: TreeNode, depth: number = 0): React.ReactNode => {
    const { node, children } = treeNode
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const color = nodeColors[node.type] || nodeColors.default
    const descendantCount = countDescendants(treeNode)

    return (
      <div key={node.id}>
        <button
          onClick={() => hasChildren && toggleNode(node.id)}
          className={`flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-zinc-700 rounded transition-colors ${
            hasChildren ? 'cursor-pointer' : 'cursor-default'
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {hasChildren ? (
            <span className={`text-zinc-500 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          ) : (
            <span className="w-3" />
          )}
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="truncate">{node.label}</span>
          <span className="text-zinc-500 text-xs">({node.type})</span>
          {hasChildren && (
            <span className="text-zinc-600 text-xs ml-auto">
              {descendantCount}
            </span>
          )}
        </button>

        {isExpanded && children.length > 0 && (
          <div>
            {children.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (tree.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 bg-zinc-800 border-b border-zinc-700">
          <span className="text-sm text-zinc-400">Tree List View</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          No tree structure. Add relationships to the chain.
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-zinc-800 border-b border-zinc-700">
        <span className="text-sm text-zinc-400">Tree List View</span>
        <span className="mx-2 text-zinc-600">•</span>
        <span className="text-sm">{tree.length} root(s)</span>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {tree.map(rootNode => renderTreeNode(rootNode, 0))}
      </div>
    </div>
  )
}

function HorizontalTreeView({ tree }: { tree: TreeNode[] }) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  const toggleNode = (id: string) => {
    const next = new Set(expandedNodes)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setExpandedNodes(next)
  }

  const renderTreeNode = (treeNode: TreeNode): React.ReactNode => {
    const { node, children } = treeNode
    const hasChildren = children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const color = nodeColors[node.type] || nodeColors.default

    return (
      <div key={node.id} className="flex items-start gap-2">
        <div className="flex-shrink-0">
          <button
            onClick={() => hasChildren && toggleNode(node.id)}
            className={`flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors ${
              hasChildren ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="whitespace-nowrap text-sm">{node.label}</span>
            {hasChildren && (
              <span className={`text-zinc-500 text-xs transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                ▶
              </span>
            )}
          </button>
        </div>

        {isExpanded && children.length > 0 && (
          <div className="flex items-start gap-2">
            <div className="flex items-center h-10 text-zinc-600">→</div>
            <div className="space-y-2">
              {children.map(child => renderTreeNode(child))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (tree.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 bg-zinc-800 border-b border-zinc-700">
          <span className="text-sm text-zinc-400">Horizontal Tree View</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-zinc-500">
          No tree structure. Add relationships to the chain.
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 bg-zinc-800 border-b border-zinc-700">
        <span className="text-sm text-zinc-400">Horizontal Tree View</span>
        <span className="mx-2 text-zinc-600">•</span>
        <span className="text-sm">{tree.length} root(s)</span>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {tree.map(rootNode => renderTreeNode(rootNode))}
        </div>
      </div>
    </div>
  )
}
