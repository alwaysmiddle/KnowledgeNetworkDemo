import { useState, useCallback, useMemo } from 'react'

export interface GraphSyncState {
  selectedNodeId: string | null
  hoveredNodeId: string | null
  focusedLayerIndex: number | null
}

export interface GraphSyncActions {
  selectNode: (nodeId: string | null) => void
  hoverNode: (nodeId: string | null) => void
  focusLayer: (layerIndex: number | null) => void
  clearSelection: () => void
}

export interface UseGraphSyncResult {
  state: GraphSyncState
  actions: GraphSyncActions
}

export function useGraphSync(): UseGraphSyncResult {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [focusedLayerIndex, setFocusedLayerIndex] = useState<number | null>(null)

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId)
  }, [])

  const hoverNode = useCallback((nodeId: string | null) => {
    setHoveredNodeId(nodeId)
  }, [])

  const focusLayer = useCallback((layerIndex: number | null) => {
    setFocusedLayerIndex(layerIndex)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null)
    setHoveredNodeId(null)
    setFocusedLayerIndex(null)
  }, [])

  const state = useMemo<GraphSyncState>(() => ({
    selectedNodeId,
    hoveredNodeId,
    focusedLayerIndex,
  }), [selectedNodeId, hoveredNodeId, focusedLayerIndex])

  const actions = useMemo<GraphSyncActions>(() => ({
    selectNode,
    hoverNode,
    focusLayer,
    clearSelection,
  }), [selectNode, hoverNode, focusLayer, clearSelection])

  return { state, actions }
}
