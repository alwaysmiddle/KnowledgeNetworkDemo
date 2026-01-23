import { useRef, useEffect, useCallback, useMemo } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'
import type { KnowledgeGraph, Layer, KnowledgeNode } from '../types'
import type { GraphSyncState, GraphSyncActions } from '../hooks/useGraphSync'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ForceGraph3DInstance = any

interface Graph3DNode extends KnowledgeNode {
  layerIndex: number
  fz?: number
  x?: number
  y?: number
  z?: number
}

interface Graph3DLink {
  source: string
  target: string
  relationship: string
}

interface Graph3DData {
  nodes: Graph3DNode[]
  links: Graph3DLink[]
}

interface Props {
  graph: KnowledgeGraph
  layers: Layer[]
  syncState: GraphSyncState
  syncActions: GraphSyncActions
}

const LAYER_COLORS: Record<string, number> = {
  class: 0x3b82f6,
  teacher: 0x10b981,
  student: 0xf59e0b,
  department: 0x8b5cf6,
  layer: 0x6366f1,
  default: 0x6b7280,
}

const LAYER_PLANE_COLORS = [
  0x3b82f6,
  0x10b981,
  0xf59e0b,
  0x8b5cf6,
  0x6366f1,
]

const LAYER_DISTANCE = 100

export function Graph3DView({ graph, layers, syncState, syncActions }: Props) {
  const fgRef = useRef<ForceGraph3DInstance | undefined>(undefined)
  const planesRef = useRef<THREE.Mesh[]>([])

  const graphData = useMemo<Graph3DData>(() => {
    if (layers.length === 0) {
      const nodes: Graph3DNode[] = graph.nodes.map((node) => ({
        ...node,
        layerIndex: 0,
        fz: 0,
      }))
      const links: Graph3DLink[] = graph.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        relationship: edge.relationship,
      }))
      return { nodes, links }
    }

    const nodeLayerMap = new Map<string, number>()
    layers.forEach((layer, layerIndex) => {
      layer.nodes.forEach(node => {
        if (!nodeLayerMap.has(node.id)) {
          nodeLayerMap.set(node.id, layerIndex)
        }
      })
    })

    const nodes: Graph3DNode[] = graph.nodes.map(node => {
      const layerIndex = nodeLayerMap.get(node.id) ?? layers.length
      return {
        ...node,
        layerIndex,
        fz: -layerIndex * LAYER_DISTANCE,
      }
    })

    const links: Graph3DLink[] = graph.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      relationship: edge.relationship,
    }))

    return { nodes, links }
  }, [graph, layers])

  const createLayerPlanes = useCallback(() => {
    if (!fgRef.current) return

    const scene = fgRef.current.scene()
    if (!scene) return

    planesRef.current.forEach(plane => scene.remove(plane))
    planesRef.current = []

    if (layers.length === 0) return

    const planeSize = 300
    layers.forEach((_, index) => {
      const geometry = new THREE.PlaneGeometry(planeSize, planeSize)
      const color = LAYER_PLANE_COLORS[index % LAYER_PLANE_COLORS.length]
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
        depthWrite: false,
      })

      const plane = new THREE.Mesh(geometry, material)
      plane.position.set(0, 0, -index * LAYER_DISTANCE)
      plane.rotation.x = 0

      const edges = new THREE.EdgesGeometry(geometry)
      const lineMaterial = new THREE.LineBasicMaterial({ color, opacity: 0.5, transparent: true })
      const wireframe = new THREE.LineSegments(edges, lineMaterial)
      wireframe.position.copy(plane.position)
      wireframe.rotation.copy(plane.rotation)

      scene.add(plane)
      scene.add(wireframe)
      planesRef.current.push(plane)
    })
  }, [layers])

  useEffect(() => {
    if (!fgRef.current) return

    const fg = fgRef.current

    fg.d3Force('charge')?.strength(-80)
    fg.d3Force('link')?.distance(60)

    const engine = fg.d3Force('z')
    if (engine) {
      fg.d3ReheatSimulation()
    }

    setTimeout(createLayerPlanes, 100)
  }, [graphData, createLayerPlanes])

  useEffect(() => {
    if (syncState.selectedNodeId && fgRef.current) {
      const node = graphData.nodes.find(n => n.id === syncState.selectedNodeId)
      if (node && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        fgRef.current.cameraPosition(
          { x: node.x, y: node.y, z: (node.z ?? 0) + 200 },
          { x: node.x, y: node.y, z: node.z ?? 0 },
          1000
        )
      }
    }
  }, [syncState.selectedNodeId, graphData.nodes])

  const handleNodeClick = useCallback((node: Graph3DNode) => {
    syncActions.selectNode(node.id)
  }, [syncActions])

  const handleNodeHover = useCallback((node: Graph3DNode | null) => {
    syncActions.hoverNode(node?.id ?? null)
    if (fgRef.current) {
      const elem = fgRef.current.renderer()?.domElement
      if (elem) {
        elem.style.cursor = node ? 'pointer' : 'default'
      }
    }
  }, [syncActions])

  const handleBackgroundClick = useCallback(() => {
    syncActions.clearSelection()
  }, [syncActions])

  const nodeColor = useCallback((node: Graph3DNode) => {
    if (syncState.selectedNodeId === node.id) {
      return '#ffffff'
    }
    if (syncState.hoveredNodeId === node.id) {
      return '#f97316'
    }
    const color = LAYER_COLORS[node.type] || LAYER_COLORS.default
    return `#${color.toString(16).padStart(6, '0')}`
  }, [syncState.selectedNodeId, syncState.hoveredNodeId])

  const nodeThreeObject = useCallback((node: Graph3DNode) => {
    const isSelected = syncState.selectedNodeId === node.id
    const isHovered = syncState.hoveredNodeId === node.id
    const baseSize = isSelected ? 12 : isHovered ? 10 : 8

    const color = LAYER_COLORS[node.type] || LAYER_COLORS.default
    const displayColor = isSelected ? 0xffffff : isHovered ? 0xf97316 : color

    const geometry = new THREE.SphereGeometry(baseSize, 16, 16)
    const material = new THREE.MeshLambertMaterial({
      color: displayColor,
      transparent: true,
      opacity: 0.9,
    })
    const sphere = new THREE.Mesh(geometry, material)

    if (isSelected || isHovered) {
      const glowGeometry = new THREE.SphereGeometry(baseSize * 1.3, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: displayColor,
        transparent: true,
        opacity: 0.3,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      sphere.add(glow)
    }

    return sphere
  }, [syncState.selectedNodeId, syncState.hoveredNodeId])

  const linkColor = useCallback((link: Graph3DLink) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as Graph3DNode).id
    const targetId = typeof link.target === 'string' ? link.target : (link.target as Graph3DNode).id

    if (syncState.selectedNodeId === sourceId || syncState.selectedNodeId === targetId) {
      return '#ffffff'
    }
    if (syncState.hoveredNodeId === sourceId || syncState.hoveredNodeId === targetId) {
      return '#f97316'
    }
    return '#4b5563'
  }, [syncState.selectedNodeId, syncState.hoveredNodeId])

  const nodeLabel = useCallback((node: Graph3DNode) => {
    const layerName = layers[node.layerIndex]?.name || 'Root'
    return `<div style="background: rgba(0,0,0,0.8); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
      <div style="font-weight: bold;">${node.label}</div>
      <div style="color: #9ca3af; font-size: 10px;">${node.type} • Layer: ${layerName}</div>
    </div>`
  }, [layers])

  return (
    <div className="h-full w-full relative bg-zinc-900">
      <div className="absolute top-3 left-3 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-3">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">3D Layered View</h3>
        <div className="space-y-1 text-xs text-zinc-400">
          {layers.length > 0 ? (
            layers.map((layer, index) => (
              <div key={layer.id} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: `#${LAYER_PLANE_COLORS[index % LAYER_PLANE_COLORS.length].toString(16).padStart(6, '0')}`,
                    opacity: 0.7,
                  }}
                />
                <span>{layer.name}</span>
                <span className="text-zinc-600">({layer.nodes.length})</span>
              </div>
            ))
          ) : (
            <div>Build a relationship chain to see layers</div>
          )}
        </div>
      </div>

      {syncState.selectedNodeId && (
        <div className="absolute bottom-3 left-3 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-3">
          <div className="text-sm">
            <span className="text-zinc-400">Selected: </span>
            <span className="font-medium">{graphData.nodes.find(n => n.id === syncState.selectedNodeId)?.label}</span>
          </div>
        </div>
      )}

      <ForceGraph3D<Graph3DNode, Graph3DLink>
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel={nodeLabel}
        nodeColor={nodeColor}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkSource="source"
        linkTarget="target"
        linkColor={linkColor}
        linkWidth={1}
        linkOpacity={0.6}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        backgroundColor="#18181b"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        controlType="orbit"
      />
    </div>
  )
}
