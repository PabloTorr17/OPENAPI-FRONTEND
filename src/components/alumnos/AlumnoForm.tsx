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
  apellido_pat: z.string().min(2, 'Mínimo 2 caracteres').max(80),
  apellido_mat: z.string().max(80).optional().or(z.literal('')),
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(100),
  id_grupo: z
    .union([z.number({ coerce: true }), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
})

// En edición no re-enviamos password si está vacío
const schemaEditar = schema.extend({
  password: z.string().max(100).optional().or(z.literal('')),
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
  } = useForm<FormValues>({
    resolver: zodResolver(initial ? schemaEditar : schema),
  })

  useEffect(() => {
    reset(
      initial
        ? {
            matricula: initial.matricula,
            nombre: initial.nombre,
            apellido_pat: initial.apellido_pat,
            apellido_mat: initial.apellido_mat ?? '',
            email: initial.email,
            password: '',
            id_grupo: initial.id_grupo,
          }
        : {
            matricula: '',
            nombre: '',
            apellido_pat: '',
            apellido_mat: '',
            email: '',
            password: '',
            id_grupo: undefined,
          }
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

      <div>
        <label className={lbl} htmlFor="nombre">Nombre(s) *</label>
        <input id="nombre" {...register('nombre')} className={field}
          aria-invalid={!!errors.nombre} placeholder="Nombre(s)" />
        {errors.nombre && <p className={err} role="alert">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl} htmlFor="apellido_pat">Apellido Paterno *</label>
          <input id="apellido_pat" {...register('apellido_pat')} className={field}
            aria-invalid={!!errors.apellido_pat} placeholder="Apellido paterno" />
          {errors.apellido_pat && <p className={err} role="alert">{errors.apellido_pat.message}</p>}
        </div>
        <div>
          <label className={lbl} htmlFor="apellido_mat">Apellido Materno</label>
          <input id="apellido_mat" {...register('apellido_mat')} className={field}
            placeholder="Apellido materno (opcional)" />
          {errors.apellido_mat && <p className={err} role="alert">{errors.apellido_mat.message}</p>}
        </div>
      </div>

      <div>
        <label className={lbl} htmlFor="email">Correo electrónico *</label>
        <input id="email" type="email" {...register('email')} className={field}
          aria-invalid={!!errors.email} placeholder="alumno@universidad.edu" />
        {errors.email && <p className={err} role="alert">{errors.email.message}</p>}
      </div>

      <div>
        <label className={lbl} htmlFor="password">
          {initial ? 'Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
        </label>
        <input id="password" type="password" {...register('password')} className={field}
          aria-invalid={!!errors.password} placeholder={initial ? '••••••••' : 'Mínimo 6 caracteres'} />
        {errors.password && <p className={err} role="alert">{errors.password.message}</p>}
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