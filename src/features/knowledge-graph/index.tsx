import { useState } from 'react'
import { mockGraph, availableRelationships } from './data/mockData'
import { RelationshipChainBuilder } from './components/RelationshipChainBuilder'
import { LayerPanel } from './components/LayerPanel'
import { GraphCanvas } from './components/GraphCanvas'
import { useLayerConstruction } from './hooks/useLayerConstruction'
import type { LayoutMode } from './types'

export default function KnowledgeGraphDemo() {
  const [relationshipChain, setRelationshipChain] = useState<string[]>([])
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('graph')
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)

  const { layers, flatGraph } = useLayerConstruction(mockGraph, relationshipChain)

  const displayData = selectedLayerId
    ? layers.find(l => l.id === selectedLayerId) || flatGraph
    : flatGraph

  return (
    <div className="h-full flex">
      <aside className="w-80 bg-zinc-800 border-r border-zinc-700 flex flex-col">
        <div className="p-4 border-b border-zinc-700">
          <h2 className="font-semibold mb-3">Relationship Chain</h2>
          <RelationshipChainBuilder
            availableRelationships={availableRelationships}
            chain={relationshipChain}
            onChange={setRelationshipChain}
          />
        </div>

        <div className="p-4 border-b border-zinc-700">
          <h2 className="font-semibold mb-3">Layout</h2>
          <div className="flex gap-2">
            {(['graph', 'tree-list', 'horizontal-tree'] as LayoutMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  layoutMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
              >
                {mode.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <h2 className="font-semibold mb-3">Layers</h2>
          <LayerPanel
            layers={layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
          />
        </div>
      </aside>

      <div className="flex-1">
        <GraphCanvas
          nodes={displayData.nodes}
          edges={displayData.edges}
          layoutMode={layoutMode}
          layers={layers}
        />
      </div>
    </div>
  )
}
