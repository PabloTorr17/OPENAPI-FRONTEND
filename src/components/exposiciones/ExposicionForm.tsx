import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Exposicion } from '@/types/exposiciones.types'

const schema = z.object({
  tema: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  fecha: z.string().min(1, 'La fecha es requerida'),
  id_equipo: z.number({ coerce: true, invalid_type_error: 'Requerido' }).positive('ID de equipo inválido'),
})

type FormValues = z.infer<typeof schema>

interface ExposicionFormProps {
  initial?: Exposicion | null
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function ExposicionForm({ initial, onSubmit, loading, onCancel }: ExposicionFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    reset(initial
      ? { tema: initial.tema, fecha: initial.fecha.slice(0, 16), id_equipo: initial.id_equipo }
      : { tema: '', fecha: '', id_equipo: undefined as any }
    )
  }, [initial, reset])

  const field = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all'
  const lbl   = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'
  const err   = 'mt-1 text-xs text-red-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="tema">Tema de la exposición *</label>
        <input id="tema" {...register('tema')} className={field}
          aria-invalid={!!errors.tema} placeholder="Ej. Patrones de diseño en REST" />
        {errors.tema && <p className={err} role="alert">{errors.tema.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="fecha">Fecha y hora *</label>
        <input id="fecha" type="datetime-local" {...register('fecha')} className={field}
          aria-invalid={!!errors.fecha} />
        {errors.fecha && <p className={err} role="alert">{errors.fecha.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="id_equipo">ID del equipo expositor *</label>
        <input id="id_equipo" type="number" {...register('id_equipo')} className={field}
          aria-invalid={!!errors.id_equipo} placeholder="ID del equipo" />
        {errors.id_equipo && <p className={err} role="alert">{errors.id_equipo.message}</p>}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition-colors">
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}