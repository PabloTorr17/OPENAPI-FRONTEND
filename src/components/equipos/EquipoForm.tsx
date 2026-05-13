import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Equipo } from '@/types/equipos.types'

const schema = z.object({
  nombre_equipo: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  id_grupo: z.number({ coerce: true, invalid_type_error: 'Requerido' }).positive('ID de grupo inválido'),
})

type FormValues = z.infer<typeof schema>

interface EquipoFormProps {
  initial?: Equipo | null
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function EquipoForm({ initial, onSubmit, loading, onCancel }: EquipoFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    reset(initial
      ? { nombre_equipo: initial.nombre_equipo, id_grupo: initial.id_grupo }
      : { nombre_equipo: '', id_grupo: undefined as any }
    )
  }, [initial, reset])

  const field = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all'
  const lbl   = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="nombre_equipo">Nombre del equipo *</label>
        <input id="nombre_equipo" {...register('nombre_equipo')} className={field}
          aria-invalid={!!errors.nombre_equipo} placeholder="Ej. Equipo Alpha" />
        {errors.nombre_equipo && <p className="mt-1 text-xs text-red-500" role="alert">{errors.nombre_equipo.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="id_grupo">ID de Grupo *</label>
        <input id="id_grupo" type="number" {...register('id_grupo')} className={field}
          aria-invalid={!!errors.id_grupo} placeholder="ID del grupo al que pertenece" />
        {errors.id_grupo && <p className="mt-1 text-xs text-red-500" role="alert">{errors.id_grupo.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}