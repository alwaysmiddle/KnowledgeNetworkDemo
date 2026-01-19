import { useMemo } from 'react'
import type { KnowledgeGraph, Layer, KnowledgeNode, KnowledgeEdge } from '../types'

interface LayerResult {
  layers: Layer[]
  flatGraph: { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }
}

export function useLayerConstruction(
  graph: KnowledgeGraph,
  relationshipChain: string[]
): LayerResult {
  return useMemo(() => {
    if (relationshipChain.length === 0) {
      return {
        layers: [],
        flatGraph: { nodes: graph.nodes, edges: graph.edges },
      }
    }

    const layers: Layer[] = []
    const assignedNodeIds = new Set<string>()

    // Find root nodes (sources of the first relationship in chain)
    const firstRelationship = relationshipChain[0]
    const firstRelEdges = graph.edges.filter(e => e.relationship === firstRelationship)
    const rootNodeIds = new Set(firstRelEdges.map(e => e.source))

    // Layer 0: Root nodes
    const rootNodes = graph.nodes.filter(n => rootNodeIds.has(n.id))
    rootNodes.forEach(n => assignedNodeIds.add(n.id))

    layers.push({
      id: 'layer-0',
      name: `Sources of "${firstRelationship}"`,
      relationship: firstRelationship,
      nodes: rootNodes,
      edges: [],
    })

    // Build subsequent layers following the relationship chain
    let currentSourceIds = rootNodeIds

    for (let i = 0; i < relationshipChain.length; i++) {
      const relationship = relationshipChain[i]
      const relevantEdges = graph.edges.filter(
        e => e.relationship === relationship && currentSourceIds.has(e.source)
      )

      const targetNodeIds = new Set(relevantEdges.map(e => e.target))
      const targetNodes = graph.nodes.filter(
        n => targetNodeIds.has(n.id) && !assignedNodeIds.has(n.id)
      )

      targetNodes.forEach(n => assignedNodeIds.add(n.id))

      if (targetNodes.length > 0) {
        layers.push({
          id: `layer-${i + 1}`,
          name: `Targets of "${relationship}"`,
          relationship,
          nodes: targetNodes,
          edges: relevantEdges,
        })
      }

      currentSourceIds = targetNodeIds
    }

    // Remaining unassigned nodes go to a "Other" layer
    const unassignedNodes = graph.nodes.filter(n => !assignedNodeIds.has(n.id))
    if (unassignedNodes.length > 0) {
      layers.push({
        id: 'layer-unassigned',
        name: 'Other Nodes',
        relationship: '',
        nodes: unassignedNodes,
        edges: [],
      })
    }

    // Flat graph includes all nodes and edges
    return {
      layers,
      flatGraph: { nodes: graph.nodes, edges: graph.edges },
    }
  }, [graph, relationshipChain])
}
