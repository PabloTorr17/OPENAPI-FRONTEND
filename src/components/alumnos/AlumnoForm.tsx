import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Alumno } from '@/types/alumnos.types'

const schema = z.object({
  matricula: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  apellido: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  email: z.string().email('Correo inválido'),
  id_grupo: z
    .union([z.number({ coerce: true }), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
})

type FormValues = z.infer<typeof schema>

interface AlumnoFormProps {
  initial?: Alumno | null
  onSubmit: (values: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function AlumnoForm({ initial, onSubmit, loading, onCancel }: AlumnoFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    reset(
      initial
        ? { matricula: initial.matricula, nombre: initial.nombre, apellido: initial.apellido, email: initial.email, id_grupo: initial.id_grupo }
        : { matricula: '', nombre: '', apellido: '', email: '', id_grupo: undefined }
    )
  }, [initial, reset])

  const field = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all'
  const lbl   = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'
  const err   = 'mt-1 text-xs text-red-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="matricula">Matrícula *</label>
        <input id="matricula" {...register('matricula')} className={field}
          aria-invalid={!!errors.matricula} placeholder="Ej. 21CS001" />
        {errors.matricula && <p className={err} role="alert">{errors.matricula.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl} htmlFor="nombre">Nombre *</label>
          <input id="nombre" {...register('nombre')} className={field}
            aria-invalid={!!errors.nombre} placeholder="Nombre(s)" />
          {errors.nombre && <p className={err} role="alert">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className={lbl} htmlFor="apellido">Apellido *</label>
          <input id="apellido" {...register('apellido')} className={field}
            aria-invalid={!!errors.apellido} placeholder="Apellido(s)" />
          {errors.apellido && <p className={err} role="alert">{errors.apellido.message}</p>}
        </div>
      </div>

      <div>
        <label className={lbl} htmlFor="email">Correo electrónico *</label>
        <input id="email" type="email" {...register('email')} className={field}
          aria-invalid={!!errors.email} placeholder="alumno@universidad.edu" />
        {errors.email && <p className={err} role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="id_grupo">ID de Grupo (opcional)</label>
        <input id="id_grupo" type="number" {...register('id_grupo')} className={field}
          placeholder="Dejar vacío si no aplica" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Guardando…' : initial ? 'Actualizar' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}