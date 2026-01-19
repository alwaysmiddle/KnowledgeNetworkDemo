import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'

const KnowledgeGraphDemo = () => import('../features/knowledge-graph')

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } = await KnowledgeGraphDemo()
          return { Component }
        },
      },
      {
        path: 'knowledge-graph/*',
        lazy: async () => {
          const { default: Component } = await KnowledgeGraphDemo()
          return { Component }
        },
      },
    ],
  },
])

export const features = [
  {
    id: 'knowledge-graph',
    name: 'Knowledge Graph',
    path: '/knowledge-graph',
    description: 'Multi-layer knowledge graph navigation',
  },
]
