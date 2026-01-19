import { useState } from 'react'
import { mockGraph, availableRelationships } from './data/mockData'
import { RelationshipChainBuilder } from './components/RelationshipChainBuilder'
import { LayerPanel } from './components/LayerPanel'
import { GraphCanvas } from './components/GraphCanvas'
import { useLayerConstruction } from './hooks/useLayerConstruction'
import type { LayoutMode } from './types'

export default function KnowledgeGraphDemo() {
  const [relationshipChain, setRelationshipChain] = useState<string[]>([])
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('home')
  const [currentLayerPath, setCurrentLayerPath] = useState<string[]>([])

  const { layers } = useLayerConstruction(mockGraph, relationshipChain)

  const hasChain = relationshipChain.length > 0

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode)
    setCurrentLayerPath([])
  }

  const handleDrillDown = (layerId: string) => {
    setCurrentLayerPath([...currentLayerPath, layerId])
  }

  const handleDrillUp = () => {
    setCurrentLayerPath(currentLayerPath.slice(0, -1))
  }

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
          <h2 className="font-semibold mb-3">View Mode</h2>
          <div className="space-y-2">
            <button
              onClick={() => handleLayoutChange('home')}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                layoutMode === 'home'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              <div className="font-medium">Home</div>
              <div className="text-sm opacity-70">Full graph view</div>
            </button>

            {hasChain && (
              <>
                <div className="text-xs text-zinc-500 uppercase tracking-wide pt-2">
                  Layered Views
                </div>
                {(['graph', 'tree-list', 'horizontal-tree'] as LayoutMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => handleLayoutChange(mode)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      layoutMode === mode
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    {mode === 'graph' && 'Graph (Drill-down)'}
                    {mode === 'tree-list' && 'Tree List'}
                    {mode === 'horizontal-tree' && 'Horizontal Tree'}
                  </button>
                ))}
              </>
            )}

            {!hasChain && (
              <p className="text-sm text-zinc-500 mt-2">
                Build a relationship chain to unlock layered views.
              </p>
            )}
          </div>
        </div>

        {hasChain && layoutMode !== 'home' && (
          <div className="flex-1 overflow-auto p-4">
            <h2 className="font-semibold mb-3">Layers</h2>
            <LayerPanel
              layers={layers}
              selectedLayerId={currentLayerPath[currentLayerPath.length - 1] || null}
              onSelectLayer={(id) => id ? setCurrentLayerPath([id]) : setCurrentLayerPath([])}
            />
          </div>
        )}
      </aside>

      <div className="flex-1">
        <GraphCanvas
          graph={mockGraph}
          layers={layers}
          layoutMode={layoutMode}
          currentLayerPath={currentLayerPath}
          onDrillDown={handleDrillDown}
          onDrillUp={handleDrillUp}
        />
      </div>
    </div>
  )
}
