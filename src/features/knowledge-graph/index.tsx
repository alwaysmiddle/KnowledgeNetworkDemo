import { useEffect, useMemo, useState } from 'react'
import { WhiteboardCanvas } from './components/WhiteboardCanvas'
import { LayerOverview } from './components/LayerOverview'
import type { WhiteboardSnapshot } from './types'

export default function KnowledgeGraphDemo() {
  const [snapshot, setSnapshot] = useState<WhiteboardSnapshot>({ nodes: [], edges: [] })
  const [layerPath, setLayerPath] = useState<string[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const activeLayer = layerPath.length > 0 ? layerPath[layerPath.length - 1] : null

  const layers = useMemo(() => {
    const set = new Set<string>()
    snapshot.nodes.forEach(node => set.add(node.layer))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [snapshot.nodes])

  const drillTargets = useMemo(() => {
    if (!selectedNodeId) return []
    const targetLayers = new Set<string>()
    snapshot.edges.forEach(edge => {
      if (edge.source !== selectedNodeId) return
      const target = snapshot.nodes.find(node => node.id === edge.target)
      if (target && target.layer !== activeLayer) {
        targetLayers.add(target.layer)
      }
    })
    return Array.from(targetLayers).sort((a, b) => a.localeCompare(b))
  }, [selectedNodeId, snapshot.edges, snapshot.nodes, activeLayer])

  useEffect(() => {
    if (!selectedNodeId) return
    if (!activeLayer) return
    const node = snapshot.nodes.find(item => item.id === selectedNodeId)
    if (node && node.layer !== activeLayer) {
      setSelectedNodeId(null)
    }
  }, [activeLayer, selectedNodeId, snapshot.nodes])

  const handleDrillDown = (layer: string) => {
    setLayerPath(prev => (prev[prev.length - 1] === layer ? prev : [...prev, layer]))
  }

  const handleDrillUp = () => {
    setLayerPath(prev => prev.slice(0, -1))
  }

  return (
    <div className="h-full w-full flex bg-[#f5f4ef] text-zinc-900">
      <section className="flex-1 border-r border-zinc-200 flex flex-col">
        <div className="px-4 py-2.5 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="text-xs uppercase tracking-wide text-zinc-400 mb-1">Path</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={() => setLayerPath([])}
              className={`px-2.5 py-1 rounded-full border transition-colors ${
                layerPath.length === 0
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
              }`}
            >
              All
            </button>
            {layerPath.map((layer, index) => (
              <button
                key={`${layer}-${index}`}
                onClick={() => setLayerPath(layerPath.slice(0, index + 1))}
                className="px-2.5 py-1 rounded-full border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 transition-colors"
              >
                {layer}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <WhiteboardCanvas
            onChange={setSnapshot}
            activeLayer={activeLayer}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            drillTargets={drillTargets}
            canDrillUp={layerPath.length > 0}
            onDrillDown={handleDrillDown}
            onDrillUp={handleDrillUp}
          />
        </div>
      </section>

      <aside className="w-[360px] bg-white">
        <div className="h-full flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-200">
            <div className="text-sm font-semibold text-zinc-900">Layered Map</div>
            <div className="text-xs text-zinc-500">
              Side view of layers and directional edges
            </div>
          </div>
          <div className="px-4 py-3 border-b border-zinc-200">
            <div className="text-xs uppercase tracking-wide text-zinc-400 mb-2">Active Layer</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLayerPath([])}
                className={`px-2.5 py-1.5 text-xs rounded-full border transition-colors ${
                  layerPath.length === 0
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                All Layers
              </button>
              {layers.map(layer => (
                <button
                  key={layer}
                  onClick={() => setLayerPath([layer])}
                  className={`px-2.5 py-1.5 text-xs rounded-full border transition-colors ${
                    activeLayer === layer && layerPath.length === 1
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <LayerOverview snapshot={snapshot} />
          </div>
        </div>
      </aside>
    </div>
  )
}
