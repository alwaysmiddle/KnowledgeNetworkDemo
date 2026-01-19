import { useState } from 'react'
import { mockGraph, availableRelationships } from './data/mockData'
import { RelationshipChainBuilder } from './components/RelationshipChainBuilder'
import { GraphCanvas } from './components/GraphCanvas'
import { useLayerConstruction } from './hooks/useLayerConstruction'
import { useTreeConstruction } from './hooks/useTreeConstruction'
import type { LayoutMode } from './types'

export default function KnowledgeGraphDemo() {
  const [relationshipChain, setRelationshipChain] = useState<string[]>([])
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('home')
  const [currentLayerPath, setCurrentLayerPath] = useState<string[]>([])

  const { layers } = useLayerConstruction(mockGraph, relationshipChain)
  const tree = useTreeConstruction(mockGraph, relationshipChain)

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

        {hasChain && (
          <div className="flex-1 overflow-auto p-4">
            <h2 className="font-semibold mb-3">Tree Roots</h2>
            <p className="text-sm text-zinc-400">
              {tree.length} root node{tree.length !== 1 ? 's' : ''} found
            </p>
            <div className="mt-2 space-y-1">
              {tree.map(t => (
                <div
                  key={t.node.id}
                  className="text-sm px-2 py-1 bg-zinc-700 rounded"
                >
                  {t.node.label}
                  <span className="text-zinc-500 ml-1">
                    ({t.children.length} children)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1">
        <GraphCanvas
          graph={mockGraph}
          layers={layers}
          tree={tree}
          layoutMode={layoutMode}
          currentLayerPath={currentLayerPath}
          onDrillDown={handleDrillDown}
          onDrillUp={handleDrillUp}
        />
      </div>
    </div>
  )
}
