import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { Equipo } from '@/types/equipos.types'

const schemaCreate = z.object({
  nombre_equipo: z.string().min(2,'Mínimo 2').max(80),
  id_grupo:      z.number({ coerce: true, invalid_type_error: 'Selecciona un grupo' }).positive('Selecciona un grupo'),
  id_alumno_creador: z.number({ coerce: true, invalid_type_error: 'Requerido' }).positive('Requerido'),
})
const schemaEdit = z.object({
  nombre_equipo: z.string().min(2,'Mínimo 2').max(80),
  id_grupo:      z.number({ coerce: true, invalid_type_error: 'Selecciona un grupo' }).positive('Selecciona un grupo'),
  id_alumno_creador: z.number({ coerce: true }).optional(),
})

type CreateValues = z.infer<typeof schemaCreate>
type EditValues   = z.infer<typeof schemaEdit>
type FormValues   = CreateValues | EditValues

interface Props {
  initial?: Equipo | null
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
  grupos: { id_grupo: number; nombre_grupo: string; nombre_materia: string; semestre: string }[]
  gruposLoading?: boolean
}

export default function EquipoForm({ initial, onSubmit, loading, onCancel, grupos, gruposLoading }: Props) {
  const isEditing = !!initial
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(isEditing ? schemaEdit : schemaCreate),
  })

  useEffect(() => {
    reset(initial
      ? { nombre_equipo: initial.nombre_equipo, id_grupo: initial.id_grupo }
      : { nombre_equipo: '', id_grupo: undefined as any, id_alumno_creador: undefined as any }
    )
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="field-label">Nombre del equipo *</label>
        <input {...register('nombre_equipo')} className="field" placeholder="Ej. Equipo Alpha" />
        {errors.nombre_equipo && <p className="field-error">{errors.nombre_equipo.message}</p>}
      </div>

      <div>
        <label className="field-label">Grupo *</label>
        {gruposLoading ? (
          <div className="field flex items-center gap-2 text-gray-400">
            <Loader2 size={13} className="animate-spin" /> Cargando grupos…
          </div>
        ) : (
          <select {...register('id_grupo')} className="field bg-white">
            <option value="">Selecciona un grupo</option>
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.nombre_grupo} — {g.nombre_materia} ({g.semestre})
              </option>
            ))}
          </select>
        )}
        {errors.id_grupo && <p className="field-error">{errors.id_grupo.message}</p>}
      </div>

      {!isEditing && (
        <div>
          <label className="field-label">Tu ID de alumno (creador) *</label>
          <input type="number" {...register('id_alumno_creador' as any)} className="field" placeholder="Tu ID" />
          {(errors as any).id_alumno_creador && <p className="field-error">{(errors as any).id_alumno_creador.message}</p>}
        </div>
      )}

      <div className="flex gap-3 pt-2" style={{ borderTop: '2px solid #e5e5e5' }}>
        <button type="button" onClick={onCancel} className="btn btn-ghost flex-1 justify-center">Cancelar</button>
        <button type="submit" disabled={loading || gruposLoading} className="btn flex-1 justify-center">
          {loading ? 'Guardando…' : isEditing ? 'Actualizar' : 'Crear equipo'}
        </button>
      </div>
    </form>
  )
}
