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
  fx?: number
  fy?: number
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
  0xec4899,
]

const LAYER_DISTANCE = 120
const PLANE_WIDTH = 350
const PLANE_HEIGHT = 250
const PLANE_DEPTH = 4

export function Graph3DView({ graph, layers, syncState, syncActions }: Props) {
  const fgRef = useRef<ForceGraph3DInstance | undefined>(undefined)
  const layerObjectsRef = useRef<THREE.Group[]>([])
  const initialCameraSet = useRef(false)

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

  const createLayerPlatforms = useCallback(() => {
    if (!fgRef.current) return

    const scene = fgRef.current.scene()
    if (!scene) return

    layerObjectsRef.current.forEach(group => scene.remove(group))
    layerObjectsRef.current = []

    if (layers.length === 0) return

    layers.forEach((layer, index) => {
      const group = new THREE.Group()
      const color = LAYER_PLANE_COLORS[index % LAYER_PLANE_COLORS.length]
      const zPos = -index * LAYER_DISTANCE

      const platformGeometry = new THREE.BoxGeometry(PLANE_WIDTH, PLANE_HEIGHT, PLANE_DEPTH)
      const platformMaterial = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
      })
      const platform = new THREE.Mesh(platformGeometry, platformMaterial)
      platform.position.set(0, 0, zPos - PLANE_DEPTH / 2)
      platform.rotation.x = Math.PI / 2
      group.add(platform)

      const edgeGeometry = new THREE.EdgesGeometry(platformGeometry)
      const edgeMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      })
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial)
      edges.position.copy(platform.position)
      edges.rotation.copy(platform.rotation)
      group.add(edges)

      const glowGeometry = new THREE.PlaneGeometry(PLANE_WIDTH + 10, PLANE_HEIGHT + 10)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.set(0, 0, zPos - PLANE_DEPTH - 1)
      glow.rotation.x = Math.PI / 2
      group.add(glow)

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 512
        canvas.height = 64
        ctx.fillStyle = 'transparent'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.font = 'bold 32px Arial'
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const labelText = layer.name.length > 30 ? layer.name.substring(0, 27) + '...' : layer.name
        ctx.fillText(labelText, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        const labelMaterial = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
        })
        const label = new THREE.Sprite(labelMaterial)
        label.position.set(0, -PLANE_HEIGHT / 2 - 20, zPos)
        label.scale.set(150, 20, 1)
        group.add(label)
      }

      scene.add(group)
      layerObjectsRef.current.push(group)
    })

    const ambientLight = scene.getObjectByName('layerAmbient')
    if (!ambientLight) {
      const ambient = new THREE.AmbientLight(0xffffff, 0.6)
      ambient.name = 'layerAmbient'
      scene.add(ambient)

      const directional = new THREE.DirectionalLight(0xffffff, 0.8)
      directional.position.set(100, 100, 200)
      directional.name = 'layerDirectional'
      scene.add(directional)
    }
  }, [layers])

  useEffect(() => {
    if (!fgRef.current) return

    const fg = fgRef.current

    fg.d3Force('charge')?.strength(-120)
    fg.d3Force('link')?.distance(50)

    if (layers.length > 0 && !initialCameraSet.current) {
      const totalHeight = (layers.length - 1) * LAYER_DISTANCE
      const centerZ = -totalHeight / 2

      setTimeout(() => {
        fg.cameraPosition(
          { x: 300, y: -250, z: centerZ + 150 },
          { x: 0, y: 0, z: centerZ },
          1500
        )
        initialCameraSet.current = true
      }, 500)
    }

    setTimeout(createLayerPlatforms, 200)
  }, [graphData, createLayerPlatforms, layers.length])

  useEffect(() => {
    if (syncState.selectedNodeId && fgRef.current) {
      const node = graphData.nodes.find(n => n.id === syncState.selectedNodeId)
      if (node && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        fgRef.current.cameraPosition(
          { x: node.x + 150, y: node.y - 100, z: (node.z ?? 0) + 100 },
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

  const nodeThreeObject = useCallback((node: Graph3DNode) => {
    const isSelected = syncState.selectedNodeId === node.id
    const isHovered = syncState.hoveredNodeId === node.id
    const baseSize = isSelected ? 14 : isHovered ? 12 : 10

    const color = LAYER_COLORS[node.type] || LAYER_COLORS.default
    const displayColor = isSelected ? 0xffffff : isHovered ? 0xf97316 : color

    const group = new THREE.Group()

    const geometry = new THREE.SphereGeometry(baseSize, 20, 20)
    const material = new THREE.MeshPhongMaterial({
      color: displayColor,
      transparent: true,
      opacity: 0.95,
      shininess: 100,
    })
    const sphere = new THREE.Mesh(geometry, material)
    group.add(sphere)

    if (isSelected || isHovered) {
      const ringGeometry = new THREE.RingGeometry(baseSize * 1.3, baseSize * 1.5, 32)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: displayColor,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      group.add(ring)

      const glowGeometry = new THREE.SphereGeometry(baseSize * 1.4, 16, 16)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: displayColor,
        transparent: true,
        opacity: 0.2,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      group.add(glow)
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      canvas.width = 256
      canvas.height = 64
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const labelText = node.label.length > 15 ? node.label.substring(0, 12) + '...' : node.label
      ctx.fillText(labelText, canvas.width / 2, canvas.height / 2)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.set(0, -baseSize - 12, 0)
      sprite.scale.set(60, 15, 1)
      group.add(sprite)
    }

    return group
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
    return '#6b7280'
  }, [syncState.selectedNodeId, syncState.hoveredNodeId])

  const linkWidth = useCallback((link: Graph3DLink) => {
    const sourceId = typeof link.source === 'string' ? link.source : (link.source as Graph3DNode).id
    const targetId = typeof link.target === 'string' ? link.target : (link.target as Graph3DNode).id

    if (syncState.selectedNodeId === sourceId || syncState.selectedNodeId === targetId) {
      return 3
    }
    if (syncState.hoveredNodeId === sourceId || syncState.hoveredNodeId === targetId) {
      return 2
    }
    return 1
  }, [syncState.selectedNodeId, syncState.hoveredNodeId])

  const nodeLabel = useCallback((node: Graph3DNode) => {
    const layerName = layers[node.layerIndex]?.name || 'Root'
    return `<div style="background: rgba(0,0,0,0.85); padding: 8px 12px; border-radius: 6px; font-size: 13px; border: 1px solid #374151;">
      <div style="font-weight: bold; color: #ffffff;">${node.label}</div>
      <div style="color: #9ca3af; font-size: 11px; margin-top: 4px;">${node.type}</div>
      <div style="color: #6b7280; font-size: 10px; margin-top: 2px;">Layer: ${layerName}</div>
    </div>`
  }, [layers])

  return (
    <div className="h-full w-full relative bg-zinc-900">
      <div className="absolute top-3 left-3 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-200 mb-2">3D Layered View</h3>
        <div className="space-y-1.5 text-xs">
          {layers.length > 0 ? (
            layers.map((layer, index) => (
              <div key={layer.id} className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded border border-white/20"
                  style={{
                    backgroundColor: `#${LAYER_PLANE_COLORS[index % LAYER_PLANE_COLORS.length].toString(16).padStart(6, '0')}`,
                  }}
                />
                <span className="text-zinc-300 flex-1">{layer.name}</span>
                <span className="text-zinc-500 bg-zinc-700/50 px-1.5 py-0.5 rounded text-[10px]">
                  {layer.nodes.length}
                </span>
              </div>
            ))
          ) : (
            <div className="text-zinc-500">Build a relationship chain to see layers</div>
          )}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-zinc-700">
        <div className="text-[10px] text-zinc-500 space-y-0.5">
          <div>Drag: Rotate</div>
          <div>Scroll: Zoom</div>
          <div>Right-drag: Pan</div>
        </div>
      </div>

      {syncState.selectedNodeId && (
        <div className="absolute bottom-3 left-3 z-10 bg-zinc-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-zinc-700">
          <div className="text-sm">
            <span className="text-zinc-400">Selected: </span>
            <span className="font-medium text-white">{graphData.nodes.find(n => n.id === syncState.selectedNodeId)?.label}</span>
          </div>
        </div>
      )}

      <ForceGraph3D<Graph3DNode, Graph3DLink>
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel={nodeLabel}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        linkSource="source"
        linkTarget="target"
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkOpacity={0.7}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        backgroundColor="#0a0a0b"
        showNavInfo={false}
        enableNodeDrag={true}
        enableNavigationControls={true}
        controlType="orbit"
      />
    </div>
  )
}
