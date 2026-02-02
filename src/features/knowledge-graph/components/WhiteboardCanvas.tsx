import { useEffect, useRef, useState } from 'react'
import { Graph, Shape } from '@antv/x6'
import type { WhiteboardSnapshot } from '../types'

interface Props {
  onChange: (snapshot: WhiteboardSnapshot) => void
  activeLayer: string | null
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
  drillTargets: string[]
  canDrillUp: boolean
  onDrillDown: (layer: string) => void
  onDrillUp: () => void
}

const DEFAULT_LAYER = 'Layer 1'

const portConfig = {
  groups: {
    top: {
      position: 'top',
      attrs: { circle: { r: 5, magnet: true, stroke: '#1f2937', strokeWidth: 1, fill: '#ffffff' } },
    },
    right: {
      position: 'right',
      attrs: { circle: { r: 5, magnet: true, stroke: '#1f2937', strokeWidth: 1, fill: '#ffffff' } },
    },
    bottom: {
      position: 'bottom',
      attrs: { circle: { r: 5, magnet: true, stroke: '#1f2937', strokeWidth: 1, fill: '#ffffff' } },
    },
    left: {
      position: 'left',
      attrs: { circle: { r: 5, magnet: true, stroke: '#1f2937', strokeWidth: 1, fill: '#ffffff' } },
    },
  },
  items: [
    { group: 'top' },
    { group: 'right' },
    { group: 'bottom' },
    { group: 'left' },
  ],
}

export function WhiteboardCanvas({
  onChange,
  activeLayer,
  selectedNodeId,
  onSelectNode,
  drillTargets,
  canDrillUp,
  onDrillDown,
  onDrillUp,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<Graph | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const activeLayerRef = useRef<string | null>(activeLayer)
  const selectedNodeRef = useRef<string | null>(null)
  const [toolbarPosition, setToolbarPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    activeLayerRef.current = activeLayer
  }, [activeLayer])

  useEffect(() => {
    if (!containerRef.current) return

    const graph = new Graph({
      container: containerRef.current,
      background: { color: '#f7f5f1' },
      grid: { size: 20, visible: true },
      panning: { enabled: true, eventTypes: ['rightMouseDown', 'mouseWheel'] },
      mousewheel: { enabled: true, modifiers: ['ctrl', 'meta'] },
      selecting: { enabled: true, rubberband: true, multiple: true },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: false,
        highlight: true,
        router: { name: 'manhattan', args: { padding: 10 } },
        connector: { name: 'rounded', args: { radius: 8 } },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: '#111827',
                strokeWidth: 2,
                targetMarker: { name: 'block', size: 10 },
              },
            },
          })
        },
      },
    })

    graphRef.current = graph

    const updateToolbarPosition = (nodeId: string) => {
      const node = graph.getCellById(nodeId)
      if (!node || !containerRef.current) {
        setToolbarPosition(null)
        return
      }
      const bbox = node.getBBox()
      const pagePoint = graph.localToPage(bbox.x + bbox.width / 2, bbox.y)
      const containerRect = containerRef.current.getBoundingClientRect()
      setToolbarPosition({
        x: pagePoint.x - containerRect.left,
        y: pagePoint.y - containerRect.top - 8,
      })
    }

    const applySelection = (nodeId: string | null) => {
      selectedNodeRef.current = nodeId
      graph.getNodes().forEach(node => {
        const isSelected = nodeId === node.id
        node.attr('body/stroke', isSelected ? '#0f172a' : '#1f2937')
        node.attr('body/strokeWidth', isSelected ? 2.5 : 1.5)
      })

      if (nodeId) {
        updateToolbarPosition(nodeId)
      } else {
        setToolbarPosition(null)
      }
      onSelectNode(nodeId)
    }

    const syncSnapshot = () => {
      const nodes = graph.getNodes().map(node => {
        const position = node.getPosition()
        const data = node.getData() as { label?: string; layer?: string } | undefined
        return {
          id: node.id,
          label: (node.attr('label/text') as string) || data?.label || 'Untitled',
          layer: data?.layer || DEFAULT_LAYER,
          x: position.x,
          y: position.y,
        }
      })

      const edges = graph.getEdges().map(edge => ({
        id: edge.id,
        source: edge.getSourceCellId() || '',
        target: edge.getTargetCellId() || '',
      })).filter(edge => edge.source && edge.target)

      onChange({ nodes, edges })
    }

    const addNodeAt = (x: number, y: number) => {
      const label = window.prompt('Node label')
      if (!label) return
      const layer = window.prompt('Layer name', activeLayerRef.current || DEFAULT_LAYER) || DEFAULT_LAYER
      const nodeId = `node-${Date.now()}`

      graph.addNode({
        id: nodeId,
        x: x - 90,
        y: y - 35,
        width: 180,
        height: 70,
        attrs: {
          body: {
            fill: '#ffffff',
            stroke: '#1f2937',
            strokeWidth: 1.5,
            rx: 12,
            ry: 12,
            shadowColor: '#c7c2b8',
            shadowBlur: 8,
            shadowOffsetX: 1,
            shadowOffsetY: 2,
          },
          label: {
            text: label,
            fill: '#111827',
            fontSize: 14,
            fontWeight: 600,
          },
        },
        data: { label, layer },
        ports: portConfig,
      })

      syncSnapshot()
      applySelection(nodeId)
    }

    graph.on('blank:click', ({ x, y }) => {
      addNodeAt(x, y)
    })

    graph.on('node:click', ({ node }) => {
      applySelection(node.id)
    })

    graph.on('node:dblclick', ({ node }) => {
      const currentLabel = node.attr('label/text') as string
      const nextLabel = window.prompt('Rename node', currentLabel || '')
      if (!nextLabel) return
      const currentLayer = (node.getData() as { layer?: string } | undefined)?.layer || DEFAULT_LAYER
      const nextLayer = window.prompt('Layer name', currentLayer) || currentLayer
      node.attr('label/text', nextLabel)
      node.setData({ label: nextLabel, layer: nextLayer })
      syncSnapshot()
      updateToolbarPosition(node.id)
    })

    graph.on('node:added', syncSnapshot)
    graph.on('node:removed', syncSnapshot)
    graph.on('node:change:position', syncSnapshot)
    graph.on('node:change:position', ({ node }) => {
      if (selectedNodeRef.current === node.id) {
        updateToolbarPosition(node.id)
      }
    })
    graph.on('node:change:data', syncSnapshot)
    graph.on('edge:added', syncSnapshot)
    graph.on('edge:removed', syncSnapshot)
    graph.on('edge:change:source', syncSnapshot)
    graph.on('edge:change:target', syncSnapshot)
    graph.on('scale', () => {
      if (selectedNodeRef.current) {
        updateToolbarPosition(selectedNodeRef.current)
      }
    })
    graph.on('translate', () => {
      if (selectedNodeRef.current) {
        updateToolbarPosition(selectedNodeRef.current)
      }
    })

    return () => {
      graph.dispose()
      graphRef.current = null
    }
  }, [onChange])

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    setIsTransitioning(true)
    const timer = window.setTimeout(() => {
      const nodes = graph.getNodes()
      const edges = graph.getEdges()

      if (!activeLayer) {
        nodes.forEach(node => node.setVisible(true))
        edges.forEach(edge => edge.setVisible(true))
      } else {
        const visibleIds = new Set<string>()
        nodes.forEach(node => {
          const data = node.getData() as { layer?: string } | undefined
          const isVisible = data?.layer === activeLayer
          node.setVisible(isVisible)
          if (isVisible) {
            visibleIds.add(node.id)
          }
        })
        edges.forEach(edge => {
          const source = edge.getSourceCellId()
          const target = edge.getTargetCellId()
          edge.setVisible(Boolean(source && target && visibleIds.has(source) && visibleIds.has(target)))
        })
      }

      setIsTransitioning(false)
    }, 180)

    return () => window.clearTimeout(timer)
  }, [activeLayer])

  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    if (!selectedNodeId) {
      graph.getNodes().forEach(node => {
        node.attr('body/stroke', '#1f2937')
        node.attr('body/strokeWidth', 1.5)
      })
      setToolbarPosition(null)
      selectedNodeRef.current = null
      return
    }

    const target = graph.getCellById(selectedNodeId)
    if (!target) {
      setToolbarPosition(null)
      selectedNodeRef.current = null
      return
    }

    selectedNodeRef.current = selectedNodeId
    graph.getNodes().forEach(node => {
      const isSelected = node.id === selectedNodeId
      node.attr('body/stroke', isSelected ? '#0f172a' : '#1f2937')
      node.attr('body/strokeWidth', isSelected ? 2.5 : 1.5)
    })

    const bbox = target.getBBox()
    const pagePoint = graph.localToPage(bbox.x + bbox.width / 2, bbox.y)
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (containerRect) {
      setToolbarPosition({
        x: pagePoint.x - containerRect.left,
        y: pagePoint.y - containerRect.top - 8,
      })
    }
  }, [selectedNodeId])

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-10 rounded-xl bg-white/90 border border-zinc-200 shadow-sm px-4 py-3 text-sm text-zinc-700">
        <div className="font-semibold text-zinc-900">Whiteboard</div>
        <div>Click empty space to add a node</div>
        <div>Drag from node edges to draw arrows</div>
        <div>Double-click a node to rename</div>
      </div>
      {selectedNodeId && toolbarPosition && (
        <div
          className="absolute z-20 rounded-full bg-white border border-zinc-200 shadow-lg px-3 py-2 text-xs text-zinc-700 flex items-center gap-2"
          style={{ left: toolbarPosition.x, top: toolbarPosition.y, transform: 'translate(-50%, -100%)' }}
        >
          <button
            onClick={onDrillUp}
            disabled={!canDrillUp}
            className={`px-2 py-1 rounded-full border transition-colors ${
              canDrillUp
                ? 'border-zinc-300 text-zinc-700 hover:border-zinc-500'
                : 'border-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Drill Up
          </button>
          <span className="text-zinc-300">|</span>
          <span className="text-zinc-500">Drill Down</span>
          {drillTargets.length === 0 && (
            <span className="text-zinc-400">No child layers</span>
          )}
          {drillTargets.map(layer => (
            <button
              key={layer}
              onClick={() => onDrillDown(layer)}
              className="px-2 py-1 rounded-full border border-zinc-300 text-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {layer}
            </button>
          ))}
        </div>
      )}
      {isTransitioning && (
        <div className="layer-transition-overlay" />
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
