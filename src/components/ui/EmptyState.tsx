interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div
        className="w-16 h-16 flex items-center justify-center mb-5 font-display text-4xl font-black text-gray-300"
        style={{ border: '3px solid #e5e5e5' }}
      >
        ∅
      </div>
      <h3 className="font-display text-2xl font-black uppercase text-gray-400 tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-sm text-gray-400 max-w-xs font-mono-brut">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
