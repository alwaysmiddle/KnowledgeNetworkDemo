import type { Layer } from '../types'

interface Props {
  layers: Layer[]
  selectedLayerId: string | null
  onSelectLayer: (layerId: string | null) => void
}

export function LayerPanel({ layers, selectedLayerId, onSelectLayer }: Props) {
  if (layers.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        No layers constructed. Add relationships to the chain above.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => onSelectLayer(null)}
        className={`w-full text-left px-3 py-2 rounded transition-colors ${
          selectedLayerId === null
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-700 hover:bg-zinc-600'
        }`}
      >
        <div className="font-medium">All Layers</div>
        <div className="text-sm opacity-70">
          {layers.reduce((sum, l) => sum + l.nodes.length, 0)} nodes
        </div>
      </button>

      {layers.map((layer, index) => (
        <button
          key={layer.id}
          onClick={() => onSelectLayer(layer.id)}
          className={`w-full text-left px-3 py-2 rounded transition-colors ${
            selectedLayerId === layer.id
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-700 hover:bg-zinc-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 flex items-center justify-center bg-zinc-600 rounded text-sm">
              {index}
            </span>
            <div>
              <div className="font-medium">{layer.name}</div>
              <div className="text-sm opacity-70">{layer.nodes.length} nodes</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
