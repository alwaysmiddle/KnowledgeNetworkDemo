import { useEffect, useMemo, useRef } from 'react'
import { Graph } from '@antv/x6'
import type { WhiteboardSnapshot } from '../types'

interface Props {
  snapshot: WhiteboardSnapshot
}

export function LayerOverview({ snapshot }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const graphRef = useRef<Graph | null>(null)

  const layers = useMemo(() => {
    const map = new Map<string, string[]>()
    snapshot.nodes.forEach(node => {
      if (!map.has(node.layer)) {
        map.set(node.layer, [])
      }
      map.get(node.layer)?.push(node.id)
    })
    return Array.from(map.entries()).map(([name, ids]) => ({ name, ids }))
  }, [snapshot.nodes])

  useEffect(() => {
    if (!containerRef.current) return

    if (!graphRef.current) {
      graphRef.current = new Graph({
        container: containerRef.current,
        background: { color: '#ffffff' },
        grid: { size: 10, visible: true },
        interacting: false,
        panning: false,
      })
    }

    const graph = graphRef.current
    graph.clearCells()

    if (layers.length === 0) {
      return
    }

    const columnGap = 210
    const rowGap = 70
    const baseX = 70
    const baseY = 90

    const nodeIdMap = new Map<string, string>()

    layers.forEach((layer, columnIndex) => {
      const headerX = baseX + columnIndex * columnGap
      graph.addNode({
        id: `layer-${layer.name}`,
        x: headerX - 70,
        y: 20,
        width: 140,
        height: 36,
        attrs: {
          body: {
            fill: '#111827',
            stroke: '#111827',
            rx: 10,
            ry: 10,
          },
          label: {
            text: layer.name,
            fill: '#ffffff',
            fontSize: 12,
            fontWeight: 600,
          },
        },
      })

      layer.ids.forEach((nodeId, rowIndex) => {
        const node = snapshot.nodes.find(n => n.id === nodeId)
        if (!node) return

        const id = `overview-${node.id}`
        nodeIdMap.set(node.id, id)

        graph.addNode({
          id,
          x: headerX - 80,
          y: baseY + rowIndex * rowGap,
          width: 160,
          height: 44,
          attrs: {
            body: {
              fill: '#f3f4f6',
              stroke: '#d1d5db',
              rx: 10,
              ry: 10,
            },
            label: {
              text: node.label,
              fill: '#111827',
              fontSize: 12,
              fontWeight: 600,
            },
          },
        })
      })
    })

    snapshot.edges.forEach(edge => {
      const source = nodeIdMap.get(edge.source)
      const target = nodeIdMap.get(edge.target)
      if (!source || !target) return

      graph.addEdge({
        source,
        target,
        attrs: {
          line: {
            stroke: '#9ca3af',
            strokeWidth: 1.5,
            targetMarker: { name: 'block', size: 6 },
          },
        },
        router: { name: 'manhattan' },
        connector: { name: 'rounded', args: { radius: 6 } },
      })
    })
  }, [layers, snapshot])

  useEffect(() => {
    return () => {
      graphRef.current?.dispose()
      graphRef.current = null
    }
  }, [])

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-4 left-4 z-10 rounded-lg bg-white/90 border border-zinc-200 px-3 py-2 text-xs text-zinc-600 shadow-sm">
        Layers overview
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
}
