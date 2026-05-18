import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { Criterio } from '@/types/evaluaciones.types'

function buildSchema(criterios: Criterio[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  criterios.forEach((c) => {
    shape[`criterio_${c.id_criterio}`] = z.number({ coerce: true }).min(0).max(10)
  })
  return z.object(shape)
}

function CriterioSlider({ value, onChange, error, label, descripcion }: {
  value: number; onChange: (v: number) => void; error?: string; label: string; descripcion?: string
}) {
  const color = value >= 8 ? '#16a34a' : value >= 6 ? '#d97706' : '#dc2626'
  const bg    = value >= 8 ? '#f0fdf4' : value >= 6 ? '#fffbeb' : '#fef2f2'

  return (
    <div className="p-4" style={{ border: '2px solid var(--ink)', background: bg }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-display text-base font-bold uppercase tracking-tight leading-none">{label}</p>
          {descripcion && <p className="font-mono-brut text-[11px] text-gray-500 mt-1">{descripcion}</p>}
        </div>
        <span className="font-display text-3xl font-black tabular-nums leading-none" style={{ color }}>{Number(value).toFixed(1)}</span>
      </div>

      <input type="range" min={0} max={10} step={0.5} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full mb-2" style={{ accentColor: 'var(--ink)' }} />

      <div className="flex justify-between font-mono-brut text-[10px] text-gray-400 mb-2">
        <span>0 Deficiente</span><span>5 Regular</span><span>10 Excelente</span>
      </div>

      <input type="number" min={0} max={10} step={0.5} value={value}
        onChange={(e) => onChange(Math.min(10, Math.max(0, Number(e.target.value))))}
        className="field w-20 py-1 text-sm" />

      {error && <p className="field-error mt-1">{error}</p>}
    </div>
  )
}

interface Props {
  criterios: Criterio[]
  criteriosLoading: boolean
  onSubmit: (data: { id_exposicion: number; id_alumno_evaluador: number; detalles: { id_criterio: number; calificacion: number }[] }) => void
  loading?: boolean
  disableSubmit?: boolean
  idExposicion?: number
  idAlumno?: number
}

export default function RubricaEvaluacion({ criterios, criteriosLoading, onSubmit, loading, disableSubmit, idExposicion, idAlumno }: Props) {
  const schema = buildSchema(criterios)
  type FormValues = z.infer<typeof schema>

  const defaultValues: Record<string, number> = {}
  criterios.forEach((c) => { defaultValues[`criterio_${c.id_criterio}`] = 5.0 })

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
  })

  useEffect(() => {
    const dv: Record<string, number> = {}
    criterios.forEach((c) => { dv[`criterio_${c.id_criterio}`] = 5.0 })
    reset(dv as any)
  }, [criterios, reset])

  const values   = watch()
  const promedio = criterios.length > 0
    ? criterios.reduce((s, c) => s + (Number(values[`criterio_${c.id_criterio}`]) || 0), 0) / criterios.length
    : 0

  const promedioColor = promedio >= 8 ? '#16a34a' : promedio >= 6 ? '#d97706' : '#dc2626'

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          id_exposicion:       idExposicion ?? 0,
          id_alumno_evaluador: idAlumno ?? 0,
          detalles: criterios.map((c) => ({ id_criterio: c.id_criterio, calificacion: Number(data[`criterio_${c.id_criterio}`]) })),
        })
      })}
      noValidate className="space-y-4"
    >
      {/* Criterios */}
      <div>
        <p className="field-label mb-3">Criterios de evaluación</p>

        {criteriosLoading && (
          <div className="flex items-center gap-2 py-8 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="font-mono-brut text-sm">Cargando criterios…</span>
          </div>
        )}

        {!criteriosLoading && criterios.length === 0 && (
          <div className="py-8 text-center" style={{ border: '2px dashed #d1d5db' }}>
            <p className="font-mono-brut text-xs text-gray-400">Sin criterios disponibles</p>
          </div>
        )}

        {!criteriosLoading && criterios.length > 0 && (
          <div className="space-y-3">
            {criterios.map((c) => (
              <Controller
                key={c.id_criterio}
                name={`criterio_${c.id_criterio}` as any}
                control={control}
                render={({ field: f, fieldState }) => (
                  <CriterioSlider
                    label={c.nombre_criterio}
                    descripcion={c.descripcion}
                    value={Number(f.value) || 0}
                    onChange={f.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Promedio */}
      {criterios.length > 0 && (
        <div className="flex items-center justify-between p-4"
          style={{ border: '3px solid var(--ink)', background: 'var(--ink)' }}>
          <span className="font-mono-brut text-xs text-gray-400 uppercase tracking-widest">Calificación estimada</span>
          <span className="font-display text-4xl font-black tabular-nums" style={{ color: promedio >= 8 ? 'var(--acid)' : promedio >= 6 ? '#fbbf24' : '#f87171' }}>
            {promedio.toFixed(2)}
          </span>
        </div>
      )}

      {disableSubmit && (
        <p className="font-mono-brut text-xs text-center py-2"
          style={{ background: '#fffbeb', border: '2px solid #fbbf24', color: '#92400e' }}>
          ↑ Selecciona exposición y alumno evaluador primero
        </p>
      )}

      <div className="flex justify-end pt-1">
        <button type="submit"
          disabled={loading || criterios.length === 0 || disableSubmit}
          className="btn btn-acid" style={{ fontSize: 14 }}>
          {loading ? 'Registrando…' : 'Registrar evaluación →'}
        </button>
      </div>
    </form>
  )
}
