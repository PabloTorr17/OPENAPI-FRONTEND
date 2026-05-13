import { useState } from 'react'
import { ClipboardCheck, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react'
import { useEvaluaciones, useCriterios, useRegistrarEvaluacion } from '@/hooks/useEvaluaciones'
import RubricaEvaluacion from '@/components/evaluaciones/RubricaEvaluacion'

function formatDate(iso: string) {
  try { return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) }
  catch { return iso }
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 8 ? 'bg-emerald-100 text-emerald-700' : score >= 6 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${cls}`}>{score.toFixed(2)}</span>
}

export default function EvaluacionesPage() {
  const [page, setPage]                 = useState(0)
  const [filterExpo, setFilterExpo]     = useState<number | undefined>()
  const [filterInput, setFilterInput]   = useState('')
  const [panelOpen, setPanelOpen]       = useState(false)
  const [exposicionId, setExposicionId] = useState<number | null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, isError }                    = useEvaluaciones({ page, size: PAGE_SIZE, id_exposicion: filterExpo })
  const { data: criterios = [], isLoading: critLoading } = useCriterios(exposicionId)
  const registrar = useRegistrarEvaluacion()

  const applyFilter = () => {
    const id = parseInt(filterInput)
    setFilterExpo(!isNaN(id) && id > 0 ? id : undefined)
    setPage(0)
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Evaluaciones</h1>
          <p className="text-sm text-slate-500">Registro con rúbrica dinámica</p>
        </div>
        <button onClick={() => setPanelOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={16} /> Nueva evaluación
        </button>
      </div>

      {/* Panel lateral — rúbrica */}
      {panelOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Registrar evaluación">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setPanelOpen(false)} />
          <div className="w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sticky top-0 bg-white z-10">
              <h2 className="text-base font-bold text-slate-800">Registrar evaluación</h2>
              <button onClick={() => { setPanelOpen(false); setExposicionId(null) }}
                aria-label="Cerrar panel"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Cargar criterios */}
            <div className="border-b border-slate-100 px-6 py-4 bg-indigo-50/50">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cargar criterios de la exposición
              </label>
              <input type="number" value={exposicionId ?? ''}
                onChange={(e) => setExposicionId(e.target.value ? Number(e.target.value) : null)}
                placeholder="ID de la exposición"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all" />
              {critLoading && <p className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600"><Loader2 size={12} className="animate-spin" /> Cargando criterios…</p>}
              {!critLoading && criterios.length > 0 && <p className="mt-2 text-xs text-emerald-600 font-medium">✓ {criterios.length} criterio(s) cargados</p>}
            </div>

            <div className="px-6 py-5 flex-1">
              <RubricaEvaluacion
                criterios={criterios}
                criteriosLoading={critLoading}
                onSubmit={async (data) => { await registrar.mutateAsync(data); setPanelOpen(false); setExposicionId(null) }}
                loading={registrar.isPending}
                onCancel={() => { setPanelOpen(false); setExposicionId(null) }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Historial */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Historial</h2>
          <div className="flex items-center gap-2">
            <input type="number" value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
              placeholder="Filtrar por ID exposición"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all w-48" />
            <button onClick={applyFilter}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors">
              Filtrar
            </button>
            {filterExpo && (
              <button onClick={() => { setFilterExpo(undefined); setFilterInput(''); setPage(0) }}
                className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
                Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" /><span className="text-sm">Cargando historial…</span>
            </div>
          )}
          {isError && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-red-500">Error al cargar evaluaciones</p>
            </div>
          )}
          {!isLoading && !isError && data?.content.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="mb-3 h-14 w-14 rounded-full bg-indigo-50 flex items-center justify-center">
                <ClipboardCheck size={22} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Sin evaluaciones</p>
              <p className="text-xs text-slate-400 mt-1">
                {filterExpo ? `No hay evaluaciones para la exposición ${filterExpo}` : 'Registra la primera evaluación.'}
              </p>
            </div>
          )}
          {!isLoading && !isError && (data?.content.length ?? 0) > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" aria-label="Historial de evaluaciones">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left">
                      {['#', 'Exposición', 'Evaluador', 'Calificación', 'Fecha', 'Criterios'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data!.content.map((ev) => (
                      <tr key={ev.id_evaluacion} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">#{ev.id_evaluacion}</td>
                        <td className="px-4 py-3 font-medium text-slate-700">Expo #{ev.id_exposicion}</td>
                        <td className="px-4 py-3 text-slate-500">Alumno #{ev.id_alumno_evaluador}</td>
                        <td className="px-4 py-3"><ScoreBadge score={ev.calificacion_final} /></td>
                        <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(ev.fecha_registro)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {ev.detalles.map((d) => (
                              <span key={d.id_criterio} title={d.nombre_criterio}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                <span className="max-w-[72px] truncate">{d.nombre_criterio}</span>
                                <span className="font-semibold">{d.calificacion}</span>
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                  <p className="text-xs text-slate-500">Página {page + 1} de {totalPages}</p>
                  <div className="flex gap-1">
                    <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                      aria-label="Página anterior"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronLeft size={16} /></button>
                    <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                      aria-label="Página siguiente"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-30 transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}