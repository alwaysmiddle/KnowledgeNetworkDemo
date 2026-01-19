import { useMemo } from 'react'
import type { KnowledgeGraph, TreeNode, KnowledgeNode } from '../types'

export function useTreeConstruction(
  graph: KnowledgeGraph,
  relationshipChain: string[]
): TreeNode[] {
  return useMemo(() => {
    if (relationshipChain.length === 0) {
      return []
    }

    const { nodes, edges } = graph
    const firstRelationship = relationshipChain[0]

    // Find root nodes - nodes that are sources of the first relationship
    const rootIds = new Set(
      edges
        .filter(e => e.relationship === firstRelationship)
        .map(e => e.source)
    )

    const rootNodes = nodes.filter(n => rootIds.has(n.id))
    const visitedInPath = new Set<string>()

    return rootNodes.map(rootNode =>
      buildSubtree(graph, rootNode, relationshipChain, 0, visitedInPath)
    )
  }, [graph, relationshipChain])
}

function buildSubtree(
  graph: KnowledgeGraph,
  node: KnowledgeNode,
  chain: string[],
  depth: number,
  visitedInPath: Set<string>
): TreeNode {
  // Prevent infinite loops in cyclic graphs
  if (visitedInPath.has(node.id)) {
    return { node, children: [], depth }
  }

  // If we've exhausted the relationship chain, this is a leaf
  if (depth >= chain.length) {
    return { node, children: [], depth }
  }

  const relationship = chain[depth]
  visitedInPath.add(node.id)

  // Find children: nodes connected via this relationship
  // Check edges where current node is the SOURCE
  const childEdges = graph.edges.filter(
    e => e.source === node.id && e.relationship === relationship
  )
  const childIds = new Set(childEdges.map(e => e.target))
  const childNodes = graph.nodes.filter(n => childIds.has(n.id))

  const children = childNodes.map(childNode =>
    buildSubtree(graph, childNode, chain, depth + 1, new Set(visitedInPath))
  )

  visitedInPath.delete(node.id)

  return {
    node,
    children,
    depth,
    relationshipToChildren: relationship,
  }
}

// Alternative: find roots by looking at nodes that are TARGETS of a relationship
export function useReverseTreeConstruction(
  graph: KnowledgeGraph,
  relationshipChain: string[]
): TreeNode[] {
  return useMemo(() => {
    if (relationshipChain.length === 0) {
      return []
    }

    const { nodes, edges } = graph
    const firstRelationship = relationshipChain[0]

    // Find root nodes - nodes that are TARGETS of the first relationship (reverse)
    const rootIds = new Set(
      edges
        .filter(e => e.relationship === firstRelationship)
        .map(e => e.target)
    )

    const rootNodes = nodes.filter(n => rootIds.has(n.id))
    const visitedInPath = new Set<string>()

    return rootNodes.map(rootNode =>
      buildReverseSubtree(graph, rootNode, relationshipChain, 0, visitedInPath)
    )
  }, [graph, relationshipChain])
}

function buildReverseSubtree(
  graph: KnowledgeGraph,
  node: KnowledgeNode,
  chain: string[],
  depth: number,
  visitedInPath: Set<string>
): TreeNode {
  if (visitedInPath.has(node.id)) {
    return { node, children: [], depth }
  }

  if (depth >= chain.length) {
    return { node, children: [], depth }
  }

  const relationship = chain[depth]
  visitedInPath.add(node.id)

  // Find children: nodes that point TO this node via this relationship (reverse)
  const childEdges = graph.edges.filter(
    e => e.target === node.id && e.relationship === relationship
  )
  const childIds = new Set(childEdges.map(e => e.source))
  const childNodes = graph.nodes.filter(n => childIds.has(n.id))

  const children = childNodes.map(childNode =>
    buildReverseSubtree(graph, childNode, chain, depth + 1, new Set(visitedInPath))
  )

  visitedInPath.delete(node.id)

  return {
    node,
    children,
    depth,
    relationshipToChildren: relationship,
  }
}
