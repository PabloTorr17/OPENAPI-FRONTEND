import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useEquipos } from '@/hooks/useEquipos'
import type { Exposicion } from '@/types/exposiciones.types'

const schema = z.object({
  titulo:           z.string().min(3,'Mínimo 3').max(200),
  fecha_exposicion: z.string().min(1,'La fecha es requerida'),
  id_equipo:        z.number({ coerce: true, invalid_type_error: 'Selecciona un equipo' }).positive('Selecciona un equipo'),
  id_rubrica:       z.number({ coerce: true, invalid_type_error: 'Requerido' }).positive('Requerido'),
  descripcion:      z.string().max(500).optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Exposicion | null
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function ExposicionForm({ initial, onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const { data: equipos = [] } = useEquipos()

  useEffect(() => {
    reset(initial
      ? { titulo: initial.titulo, fecha_exposicion: initial.fecha_exposicion.slice(0,16), id_equipo: initial.id_equipo, id_rubrica: initial.id_rubrica, descripcion: initial.descripcion ?? '' }
      : { titulo: '', fecha_exposicion: '', id_equipo: undefined as any, id_rubrica: undefined as any, descripcion: '' }
    )
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="field-label">Título *</label>
        <input {...register('titulo')} className="field" placeholder="Ej. Patrones de diseño REST" />
        {errors.titulo && <p className="field-error">{errors.titulo.message}</p>}
      </div>

      <div>
        <label className="field-label">Fecha y hora *</label>
        <input type="datetime-local" {...register('fecha_exposicion')} className="field" />
        {errors.fecha_exposicion && <p className="field-error">{errors.fecha_exposicion.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="field-label">Equipo *</label>
          <select {...register('id_equipo')} className="field bg-white">
            <option value="">Selecciona equipo</option>
            {equipos.map((eq) => (
              <option key={eq.id_equipo} value={eq.id_equipo}>
                {eq.nombre_equipo}{eq.nombre_grupo ? ` — ${eq.nombre_grupo}` : ''}
              </option>
            ))}
          </select>
          {errors.id_equipo && <p className="field-error">{errors.id_equipo.message}</p>}
        </div>
        <div>
          <label className="field-label">ID Rúbrica *</label>
          <input type="number" {...register('id_rubrica')} className="field" placeholder="ID de rúbrica" />
          {errors.id_rubrica && <p className="field-error">{errors.id_rubrica.message}</p>}
        </div>
      </div>

      <div>
        <label className="field-label">Descripción (opcional)</label>
        <textarea {...register('descripcion')} className="field resize-none" rows={3} placeholder="Descripción breve…" />
      </div>

      <div className="flex gap-3 pt-2" style={{ borderTop: '2px solid #e5e5e5' }}>
        <button type="button" onClick={onCancel} className="btn btn-ghost flex-1 justify-center">Cancelar</button>
        <button type="submit" disabled={loading} className="btn flex-1 justify-center">
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}
