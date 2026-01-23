export interface KnowledgeNode {
  id: string
  label: string
  type: string
  metadata?: Record<string, unknown>
}

export interface KnowledgeEdge {
  id: string
  source: string
  target: string
  relationship: string
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export interface Layer {
  id: string
  name: string
  relationship: string
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

export interface RelationshipChain {
  relationships: string[]
}

export interface TreeNode {
  node: KnowledgeNode
  children: TreeNode[]
  depth: number
  relationshipToChildren?: string
}

export type LayoutMode = 'home' | 'graph' | 'tree-list' | 'horizontal-tree'

export type ViewMode = '2d' | '3d' | 'split'
