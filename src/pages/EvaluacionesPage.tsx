import { useState } from 'react'
import { ClipboardCheck, CheckCircle2, Loader2, Star } from 'lucide-react'
import { useRegistrarEvaluacion } from '@/hooks/useEvaluaciones'
import RubricaEvaluacion from '@/components/evaluaciones/RubricaEvaluacion'
import type { Criterio } from '@/types/evaluaciones.types'

// Criterios hardcodeados según el OpenAPI de ejemplo
// Cuando el backend exponga GET /criterios, reemplaza esto por useCriterios()
const CRITERIOS_DEMO: Criterio[] = [
  { id_criterio: 1, nombre_criterio: 'Dominio del tema',         descripcion: 'Conocimiento y manejo del contenido expuesto' },
  { id_criterio: 2, nombre_criterio: 'Claridad en la exposición', descripcion: 'Comunicación clara y ordenada de las ideas' },
  { id_criterio: 3, nombre_criterio: 'Material de apoyo',         descripcion: 'Calidad y pertinencia del material presentado' },
]

type EvalResult = {
  id_evaluacion: number
  calificacion_final: number
  fecha_registro: string
}

export default function EvaluacionesPage() {
  const [resultado, setResultado]       = useState<EvalResult | null>(null)
  const [idExposicion, setIdExposicion] = useState('')
  const [idAlumno, setIdAlumno]         = useState('')
  const registrar = useRegistrarEvaluacion()

  // Cuando el backend tenga GET /criterios, cambia CRITERIOS_DEMO por:
  // const { data: criterios = [], isLoading: critLoading } = useCriterios(idExposicion ? Number(idExposicion) : null)
  const criterios = CRITERIOS_DEMO

  const handleSubmit = async (data: { id_exposicion: number; id_alumno_evaluador: number; detalles: { id_criterio: number; calificacion: number }[] }) => {
    const res = await registrar.mutateAsync(data)
    setResultado({
      id_evaluacion:      res.id_evaluacion,
      calificacion_final: res.calificacion_final ?? 0,
      fecha_registro:     res.fecha_registro ?? new Date().toISOString(),
    })
  }

  const handleNueva = () => {
    setResultado(null)
    setIdExposicion('')
    setIdAlumno('')
  }

  const promedioColor = (n: number) =>
    n >= 8 ? 'text-emerald-600' : n >= 6 ? 'text-amber-500' : 'text-red-500'

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Evaluaciones</h1>
        <p className="text-sm text-slate-500">Registro de evaluación con rúbrica</p>
      </div>

      {/* Resultado post-registro */}
      {resultado && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 flex flex-col items-center text-center gap-3">
          <CheckCircle2 size={36} className="text-emerald-500" />
          <h2 className="text-lg font-bold text-slate-800">¡Evaluación registrada!</h2>
          <p className="text-sm text-slate-500">
            ID de evaluación: <span className="font-semibold text-slate-700">#{resultado.id_evaluacion}</span>
          </p>
          <p className="text-sm text-slate-500">
            Calificación final:{' '}
            <span className={`text-3xl font-bold ${promedioColor(resultado.calificacion_final)}`}>
              {Number(resultado.calificacion_final).toFixed(2)}
            </span>
          </p>
          <button
            onClick={handleNueva}
            className="mt-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Registrar otra evaluación
          </button>
        </div>
      )}

      {/* Formulario de evaluación */}
      {!resultado && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Contexto */}
          <div className="border-b border-slate-100 bg-indigo-50/50 px-6 py-4 rounded-t-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Contexto de la evaluación
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="ctx_expo">
                  ID de la exposición
                </label>
                <input
                  id="ctx_expo"
                  type="number"
                  value={idExposicion}
                  onChange={(e) => setIdExposicion(e.target.value)}
                  placeholder="Ej. 2"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="ctx_alumno">
                  Tu ID de alumno evaluador
                </label>
                <input
                  id="ctx_alumno"
                  type="number"
                  value={idAlumno}
                  onChange={(e) => setIdAlumno(e.target.value)}
                  placeholder="Tu ID"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
            </div>

            {/* Nota sobre criterios */}
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <Star size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700">
                Los criterios se muestran con los valores del OpenAPI. Cuando el backend exponga{' '}
                <code className="font-mono">GET /criterios</code>, se cargarán dinámicamente.
              </p>
            </div>
          </div>

          {/* Rúbrica */}
          <div className="px-6 py-5">
            <RubricaEvaluacion
              criterios={criterios}
              criteriosLoading={false}
              onSubmit={(data) => handleSubmit({
                ...data,
                id_exposicion:       idExposicion ? Number(idExposicion) : data.id_exposicion,
                id_alumno_evaluador: idAlumno     ? Number(idAlumno)     : data.id_alumno_evaluador,
              })}
              loading={registrar.isPending}
              onCancel={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  )
}