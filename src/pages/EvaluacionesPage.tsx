import { useState } from 'react'
import { CheckCircle2, Star, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useRegistrarEvaluacion } from '@/hooks/useEvaluaciones'
import { evaluacionesService } from '@/services/evaluaciones.service'
import { exposicionesService } from '@/services/exposiciones.service'
import { alumnosService } from '@/services/alumnos.service'
import RubricaEvaluacion from '@/components/evaluaciones/RubricaEvaluacion'
import type { Criterio } from '@/types/evaluaciones.types'

const CRITERIOS_DEMO: Criterio[] = [
  { id_criterio: 1, nombre_criterio: 'Dominio del tema',           descripcion: 'Conocimiento y manejo del contenido' },
  { id_criterio: 2, nombre_criterio: 'Claridad en la exposición',  descripcion: 'Comunicación clara y ordenada' },
  { id_criterio: 3, nombre_criterio: 'Material de apoyo',          descripcion: 'Calidad y pertinencia del material' },
]

type EvalResult = { id_evaluacion: number; calificacion_final: number; fecha_registro: string }

export default function EvaluacionesPage() {
  const [resultado, setResultado]       = useState<EvalResult|null>(null)
  const [idExposicion, setIdExposicion] = useState<string>('')
  const [idAlumno, setIdAlumno]         = useState<string>('')

  const registrar = useRegistrarEvaluacion()

  const { data: exposicionesData, isLoading: loadingExpo } = useQuery({
    queryKey: ['eval-exposiciones'],
    queryFn: () => exposicionesService.listar({ page: 0, size: 100, search: '' }),
  })
  const exposiciones = exposicionesData?.content ?? []

  const { data: alumnosData, isLoading: loadingAlumnos } = useQuery({
    queryKey: ['eval-alumnos'],
    queryFn: () => alumnosService.listar({ page: 0, size: 200 }),
  })
  const alumnos = alumnosData?.content ?? []

  const { data: criteriosDinamicos, isLoading: critLoading } = useQuery({
    queryKey: ['criterios', idExposicion],
    queryFn: () => evaluacionesService.obtenerCriterios(Number(idExposicion)),
    enabled: !!idExposicion,
    retry: false,
  })
  const criterios = criteriosDinamicos ?? CRITERIOS_DEMO

  const handleSubmit = async (data: {
    id_exposicion: number; id_alumno_evaluador: number
    detalles: { id_criterio: number; calificacion: number }[]
  }) => {
    const res = await registrar.mutateAsync({
      id_exposicion:       Number(idExposicion),
      id_alumno_evaluador: Number(idAlumno),
      detalles:            data.detalles,
    })
    const cal = res.calificacion_final != null
      ? Number(res.calificacion_final)
      : res.detalles?.length
        ? res.detalles.reduce((s, d) => s + d.calificacion, 0) / res.detalles.length
        : 0
    setResultado({ id_evaluacion: res.id_evaluacion, calificacion_final: cal, fecha_registro: res.fecha_registro ?? new Date().toISOString() })
  }

  const handleNueva = () => { setResultado(null); setIdExposicion(''); setIdAlumno('') }

  const calColor = (n: number) => n >= 8 ? '#16a34a' : n >= 6 ? '#d97706' : '#dc2626'
  const calBg    = (n: number) => n >= 8 ? '#f0fdf4' : n >= 6 ? '#fffbeb' : '#fef2f2'
  const calLabel = (n: number) => n >= 9 ? 'Excelente' : n >= 8 ? 'Muy bien' : n >= 7 ? 'Bien' : n >= 6 ? 'Suficiente' : 'Reprobado'

  const selectCls = 'field bg-white'

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-none">Evaluaciones</h1>
        <p className="font-mono-brut text-xs text-gray-500 mt-1">Registro con rúbrica dinámica</p>
      </div>

      {/* ── Resultado ── */}
      {resultado && (
        <div className="p-0 overflow-hidden" style={{ border: '3px solid var(--ink)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Top bar */}
          <div className="bg-[var(--ink)] flex items-center gap-3 px-6 py-4">
            <CheckCircle2 size={22} color="var(--acid)" strokeWidth={2.5} />
            <span className="font-display text-xl font-black uppercase text-[var(--paper)] tracking-tight">¡Evaluación registrada!</span>
            <span className="font-mono-brut text-xs text-gray-400 ml-auto">#{resultado.id_evaluacion}</span>
          </div>

          {/* Score block */}
          <div className="flex flex-col sm:flex-row">
            <div className="flex-1 flex flex-col items-center justify-center py-10 px-6"
              style={{ background: calBg(resultado.calificacion_final), borderRight: '3px solid var(--ink)' }}>
              <p className="font-mono-brut text-[10px] uppercase tracking-widest text-gray-400 mb-2">Calificación final</p>
              <span className="font-display font-black tabular-nums leading-none"
                style={{ fontSize: 80, color: calColor(resultado.calificacion_final) }}>
                {resultado.calificacion_final.toFixed(2)}
              </span>
              <span className="font-display text-lg font-bold uppercase mt-1"
                style={{ color: calColor(resultado.calificacion_final) }}>
                {calLabel(resultado.calificacion_final)}
              </span>
              <span className="font-mono-brut text-xs text-gray-400 mt-1">sobre 10.00</span>
            </div>

            <div className="sm:w-56 flex flex-col justify-between p-5 bg-white">
              <div>
                <p className="font-mono-brut text-[10px] uppercase tracking-widest text-gray-400 mb-1">Registrada</p>
                <p className="font-mono-brut text-xs text-gray-700">
                  {new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(resultado.fecha_registro))}
                </p>
              </div>
              <button onClick={handleNueva} className="btn btn-acid w-full justify-center mt-6">
                Nueva evaluación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Formulario ── */}
      {!resultado && (
        <div className="panel overflow-hidden">

          {/* Contexto */}
          <div className="px-6 py-5 bg-[var(--ink)]">
            <p className="font-mono-brut text-[10px] uppercase tracking-widest text-[var(--acid)] mb-4">
              — Contexto de la evaluación
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Exposición */}
              <div>
                <label className="field-label" style={{ color: '#9ca3af' }}>Exposición *</label>
                {loadingExpo
                  ? <div className="field flex items-center gap-2 text-gray-500"><Loader2 size={13} className="animate-spin" /> Cargando…</div>
                  : (
                    <select value={idExposicion} onChange={(e) => setIdExposicion(e.target.value)} className={selectCls}>
                      <option value="">Selecciona una exposición</option>
                      {exposiciones.map((ex) => (
                        <option key={ex.id_exposicion} value={ex.id_exposicion}>
                          #{ex.id_exposicion} — {ex.titulo}
                        </option>
                      ))}
                    </select>
                  )
                }
              </div>

              {/* Alumno */}
              <div>
                <label className="field-label" style={{ color: '#9ca3af' }}>Alumno evaluador *</label>
                {loadingAlumnos
                  ? <div className="field flex items-center gap-2 text-gray-500"><Loader2 size={13} className="animate-spin" /> Cargando…</div>
                  : (
                    <select value={idAlumno} onChange={(e) => setIdAlumno(e.target.value)} className={selectCls}>
                      <option value="">Selecciona el alumno</option>
                      {alumnos.map((al) => (
                        <option key={al.id_alumno} value={al.id_alumno}>
                          {al.matricula} — {al.nombre} {al.apellido_pat}
                        </option>
                      ))}
                    </select>
                  )
                }
              </div>
            </div>

            {/* Nota criterios demo */}
            {idExposicion && !critLoading && !criteriosDinamicos && (
              <div className="mt-4 flex items-start gap-2 px-3 py-2"
                style={{ border: '2px solid #fbbf24', background: '#fffbeb' }}>
                <Star size={13} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="font-mono-brut text-xs text-yellow-700">
                  Criterios demo activos — el backend aún no expone <code>GET /criterios</code>
                </p>
              </div>
            )}

            {idExposicion && critLoading && (
              <div className="mt-3 flex items-center gap-2 text-gray-400">
                <Loader2 size={13} className="animate-spin" />
                <span className="font-mono-brut text-xs">Cargando criterios…</span>
              </div>
            )}
          </div>

          {/* Rúbrica */}
          <div className="p-6">
            <RubricaEvaluacion
              criterios={criterios}
              criteriosLoading={critLoading && !!idExposicion}
              onSubmit={handleSubmit}
              loading={registrar.isPending}
              disableSubmit={!idExposicion || !idAlumno}
              idExposicion={idExposicion ? Number(idExposicion) : undefined}
              idAlumno={idAlumno ? Number(idAlumno) : undefined}
            />
          </div>
        </div>
      )}
    </div>
  )
}
