import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'

export interface KGNodeData {
  label: string
  nodeType: string
  hasChildren: boolean
  [key: string]: unknown
}

export function KGNodeComponent({ data, selected }: NodeProps) {
  const { label, hasChildren } = data as KGNodeData

  return (
    <div
      className={[
        'relative flex items-center justify-center rounded-xl border-2 shadow-sm transition-all duration-150 cursor-pointer select-none',
        'bg-white text-slate-700 text-sm font-medium',
        selected
          ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 shadow-md'
          : 'border-slate-300 hover:border-blue-400 hover:scale-105 hover:shadow-md',
      ].join(' ')}
      style={{ width: 120, height: 50 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <span className="px-2 text-center leading-tight">{label}</span>

      {hasChildren && (
        <span className="absolute bottom-0.5 right-1.5 text-[10px] text-slate-400">▼</span>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
