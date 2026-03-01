import { useState, useMemo } from 'react'

import { mockGraph } from './data/mockGraph'
import { SCHOOL_LAYER_NAMES, SCHOOL_RELATIONSHIP_CHAIN } from './data/layerConfig'
import { computeLayers } from './lib/computeLayers'
import { filterLayer } from './lib/filterLayer'
import { useLayerTransition } from './lib/useLayerTransition'

import { LayerCanvas } from './components/LayerCanvas'
import { NodeContextMenu } from './components/NodeContextMenu'
import { Breadcrumb } from './components/Breadcrumb'

import type { NavigationState, FilterStep } from './types'

const layers = computeLayers(mockGraph, SCHOOL_RELATIONSHIP_CHAIN, SCHOOL_LAYER_NAMES)

interface ContextMenuState {
  nodeId: string
  nodeLabel: string
  position: { x: number; y: number }
}

function App() {
  const [navState, setNavState] = useState<NavigationState>({
    currentLayerIndex: 0,
    filterPath: [],
  })
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const { transitionClass, triggerTransition } = useLayerTransition()

  const { currentLayerIndex, filterPath } = navState

  // Compute visible nodes and edges for current layer + filter
  const { nodes, edges } = useMemo(
    () => filterLayer(mockGraph, layers, currentLayerIndex, filterPath),
    [currentLayerIndex, filterPath]
  )

  // Nodes that have children in the next layer
  const hasChildrenIds = useMemo(() => {
    const outgoingRels = layers[currentLayerIndex]?.outgoingRelationships ?? []
    return new Set(
      mockGraph.edges
        .filter(e => outgoingRels.includes(e.relationship))
        .map(e => e.source)
    )
  }, [currentLayerIndex])

  const handleNodeClick = (nodeId: string) => {
    const node = mockGraph.nodes.find(n => n.id === nodeId)
    if (!node) return
    setContextMenu({
      nodeId,
      nodeLabel: node.label,
      position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    })
  }

  const handleNodeContextMenu = (nodeId: string, position: { x: number; y: number }) => {
    const node = mockGraph.nodes.find(n => n.id === nodeId)
    if (!node) return
    setContextMenu({ nodeId, nodeLabel: node.label, position })
  }

  const handleDrillDown = () => {
    if (!contextMenu) return
    const { nodeId, nodeLabel } = contextMenu
    const newStep: FilterStep = { layerIndex: currentLayerIndex, nodeId, nodeLabel }

    triggerTransition(() => {
      setNavState(prev => ({
        currentLayerIndex: prev.currentLayerIndex + 1,
        filterPath: [...prev.filterPath, newStep],
      }))
    })
  }

  const handleDrillUp = () => {
    triggerTransition(() => {
      setNavState(prev => ({
        currentLayerIndex: Math.max(0, prev.currentLayerIndex - 1),
        filterPath: prev.filterPath.slice(0, -1),
      }))
    })
  }

  const handleBreadcrumbNavigate = (stepIndex: number) => {
    triggerTransition(() => {
      if (stepIndex < 0) {
        // Navigate to root
        setNavState({ currentLayerIndex: 0, filterPath: [] })
      } else {
        setNavState({
          currentLayerIndex: stepIndex + 1,
          filterPath: filterPath.slice(0, stepIndex + 1),
        })
      }
    })
  }

  const canDrillDown = contextMenu ? hasChildrenIds.has(contextMenu.nodeId) : false
  const canDrillUp = currentLayerIndex > 0

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="h-14 px-4 flex items-center border-b bg-white shadow-sm shrink-0">
        <h1 className="text-lg font-semibold text-slate-700">Knowledge Graph Demo</h1>
      </header>

      <div className="px-4 py-2 border-b bg-white shrink-0">
        <Breadcrumb
          filterPath={filterPath}
          layerNames={SCHOOL_LAYER_NAMES}
          currentLayerIndex={currentLayerIndex}
          onNavigateTo={handleBreadcrumbNavigate}
        />
      </div>

      <main className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 transition-all duration-300 ${transitionClass}`}>
          <LayerCanvas
            nodes={nodes}
            edges={edges}
            hasChildrenIds={hasChildrenIds}
            onNodeClick={handleNodeClick}
            onNodeContextMenu={handleNodeContextMenu}
          />
        </div>

        {contextMenu && (
          <NodeContextMenu
            nodeId={contextMenu.nodeId}
            nodeLabel={contextMenu.nodeLabel}
            canDrillDown={canDrillDown}
            canDrillUp={canDrillUp}
            onDrillDown={handleDrillDown}
            onDrillUp={handleDrillUp}
            onClose={() => setContextMenu(null)}
            position={contextMenu.position}
          />
        )}
      </main>

      {/* Step 12 — Footer bar */}
      <footer className="h-10 px-4 flex items-center justify-between border-t bg-white text-sm text-slate-500 shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-700">{SCHOOL_LAYER_NAMES[currentLayerIndex]}</span>
          <span>{nodes.length} nodes</span>
          {filterPath.length > 0 && (
            <span className="text-slate-400">
              filtered by: {filterPath[filterPath.length - 1].nodeLabel}
            </span>
          )}
        </div>
        <button
          onClick={handleDrillUp}
          disabled={!canDrillUp}
          className="px-3 py-1 rounded border text-sm transition-colors
            disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed
            enabled:border-slate-300 enabled:text-slate-600 enabled:hover:border-blue-400 enabled:hover:text-blue-600"
        >
          ← Back
        </button>
      </footer>
    </div>
  )
}

export default App
