import { useState } from 'react'
import { mockGraph, availableRelationships } from './data/mockData'
import { RelationshipChainBuilder } from './components/RelationshipChainBuilder'
import { GraphCanvas } from './components/GraphCanvas'
import { Graph3DView } from './components/Graph3DView'
import { useLayerConstruction } from './hooks/useLayerConstruction'
import { useTreeConstruction } from './hooks/useTreeConstruction'
import { useGraphSync } from './hooks/useGraphSync'
import type { LayoutMode, ViewMode } from './types'

export default function KnowledgeGraphDemo() {
  const [relationshipChain, setRelationshipChain] = useState<string[]>([])
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('home')
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [currentLayerPath, setCurrentLayerPath] = useState<string[]>([])

  const { layers } = useLayerConstruction(mockGraph, relationshipChain)
  const tree = useTreeConstruction(mockGraph, relationshipChain)
  const { state: syncState, actions: syncActions } = useGraphSync()

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
      <aside className="w-80 bg-zinc-800 border-r border-zinc-700 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-zinc-700">
          <h2 className="font-semibold mb-3">Relationship Chain</h2>
          <RelationshipChainBuilder
            availableRelationships={availableRelationships}
            chain={relationshipChain}
            onChange={setRelationshipChain}
          />
        </div>

        <div className="p-4 border-b border-zinc-700">
          <h2 className="font-semibold mb-3">Display Mode</h2>
          <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('2d')}
              className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === '2d'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              2D Only
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === 'split'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`flex-1 px-3 py-1.5 rounded text-sm transition-colors ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              3D Only
            </button>
          </div>
        </div>

        {viewMode !== '3d' && (
          <div className="p-4 border-b border-zinc-700">
            <h2 className="font-semibold mb-3">2D View Mode</h2>
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
                  <button
                    onClick={() => handleLayoutChange('graph')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      layoutMode === 'graph'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    Graph (Drill-down)
                  </button>
                  <button
                    onClick={() => handleLayoutChange('tree-list')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      layoutMode === 'tree-list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    <div>Tree List</div>
                    <div className="text-sm opacity-70">Recursive folder structure</div>
                  </button>
                  <button
                    onClick={() => handleLayoutChange('horizontal-tree')}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      layoutMode === 'horizontal-tree'
                        ? 'bg-blue-600 text-white'
                        : 'bg-zinc-700 hover:bg-zinc-600'
                    }`}
                  >
                    <div>Horizontal Tree</div>
                    <div className="text-sm opacity-70">Left-to-right expansion</div>
                  </button>
                </>
              )}

              {!hasChain && (
                <p className="text-sm text-zinc-500 mt-2">
                  Build a relationship chain to unlock layered views.
                </p>
              )}
            </div>
          </div>
        )}

        {hasChain && (
          <div className="flex-1 overflow-auto p-4">
            <h2 className="font-semibold mb-3">Layers ({layers.length})</h2>
            <div className="space-y-2">
              {layers.map((layer, index) => (
                <div
                  key={layer.id}
                  className="text-sm px-3 py-2 bg-zinc-700/50 rounded"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 text-xs">L{index}</span>
                    <span className="font-medium">{layer.name}</span>
                  </div>
                  <div className="text-zinc-500 text-xs mt-1">
                    {layer.nodes.length} nodes
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex">
        {(viewMode === '2d' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2 border-r border-zinc-700' : 'flex-1'}>
            <GraphCanvas
              graph={mockGraph}
              layers={layers}
              tree={tree}
              layoutMode={layoutMode}
              currentLayerPath={currentLayerPath}
              onDrillDown={handleDrillDown}
              onDrillUp={handleDrillUp}
              syncState={syncState}
              syncActions={syncActions}
            />
          </div>
        )}

        {(viewMode === '3d' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'w-1/2' : 'flex-1'}>
            <Graph3DView
              graph={mockGraph}
              layers={layers}
              syncState={syncState}
              syncActions={syncActions}
            />
          </div>
        )}
      </div>
    </div>
  )
}
