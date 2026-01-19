interface Props {
  availableRelationships: string[]
  chain: string[]
  onChange: (chain: string[]) => void
}

export function RelationshipChainBuilder({ availableRelationships, chain, onChange }: Props) {
  const addRelationship = (relationship: string) => {
    onChange([...chain, relationship])
  }

  const removeRelationship = (index: number) => {
    onChange(chain.filter((_, i) => i !== index))
  }

  const clearChain = () => {
    onChange([])
  }

  const unusedRelationships = availableRelationships.filter(r => !chain.includes(r))

  return (
    <div className="space-y-3">
      {chain.length > 0 && (
        <div className="space-y-2">
          {chain.map((rel, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-zinc-500 text-sm">→</span>
              )}
              <div className="flex-1 flex items-center justify-between bg-zinc-700 rounded px-3 py-1.5">
                <span className="text-sm">{rel}</span>
                <button
                  onClick={() => removeRelationship(index)}
                  className="text-zinc-400 hover:text-red-400 ml-2"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={clearChain}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Clear all
          </button>
        </div>
      )}

      {unusedRelationships.length > 0 && (
        <div>
          <p className="text-sm text-zinc-400 mb-2">
            {chain.length === 0 ? 'Select starting relationship:' : 'Add next:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {unusedRelationships.map(rel => (
              <button
                key={rel}
                onClick={() => addRelationship(rel)}
                className="px-2 py-1 text-sm bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
              >
                {rel}
              </button>
            ))}
          </div>
        </div>
      )}

      {chain.length === 0 && (
        <p className="text-sm text-zinc-500">
          Build a relationship chain to construct layers from the graph.
        </p>
      )}
    </div>
  )
}
