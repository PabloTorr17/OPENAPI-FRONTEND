import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useGrupos } from '@/hooks/useGrupos'
import type { Alumno } from '@/types/alumnos.types'

const schema = z.object({
  matricula:    z.string().min(3).max(20).regex(/^[A-Za-z0-9-]+$/, 'Solo letras, números y guiones'),
  nombre:       z.string().min(2).max(80),
  apellido_pat: z.string().min(2).max(80),
  apellido_mat: z.string().max(80).optional().or(z.literal('')),
  email:        z.string().email('Correo inválido'),
  password:     z.string().min(6).max(100),
  id_grupo:     z.union([z.number({ coerce: true }), z.literal('')]).optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
})

const schemaEdit = schema.extend({
  password: z.string().max(100).optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

interface Props {
  initial?: Alumno | null
  onSubmit: (values: FormValues) => void
  loading?: boolean
  onCancel: () => void
}

export default function AlumnoForm({ initial, onSubmit, loading, onCancel }: Props) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(initial ? schemaEdit : schema),
  })

  const { data: gruposData } = useGrupos(0, 100, '')
  const grupos = gruposData?.content ?? []

  useEffect(() => {
    reset(initial
      ? { matricula: initial.matricula, nombre: initial.nombre, apellido_pat: initial.apellido_pat, apellido_mat: initial.apellido_mat ?? '', email: initial.email, password: '', id_grupo: initial.id_grupo }
      : { matricula: '', nombre: '', apellido_pat: '', apellido_mat: '', email: '', password: '', id_grupo: undefined }
    )
  }, [initial, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="field-label">Matrícula *</label>
        <input {...register('matricula')} className="field" placeholder="21CS001" />
        {errors.matricula && <p className="field-error">{errors.matricula.message}</p>}
      </div>

      <div>
        <label className="field-label">Nombre(s) *</label>
        <input {...register('nombre')} className="field" placeholder="Nombre(s)" />
        {errors.nombre && <p className="field-error">{errors.nombre.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Apellido paterno *</label>
          <input {...register('apellido_pat')} className="field" placeholder="Paterno" />
          {errors.apellido_pat && <p className="field-error">{errors.apellido_pat.message}</p>}
        </div>
        <div>
          <label className="field-label">Apellido materno</label>
          <input {...register('apellido_mat')} className="field" placeholder="Materno" />
        </div>
      </div>

      <div>
        <label className="field-label">Correo *</label>
        <input type="email" {...register('email')} className="field" placeholder="alumno@tec.mx" />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <div>
        <label className="field-label">{initial ? 'Contraseña (vacío = sin cambios)' : 'Contraseña *'}</label>
        <input type="password" {...register('password')} className="field" placeholder="••••••••" />
        {errors.password && <p className="field-error">{errors.password.message}</p>}
      </div>

      <div>
        <label className="field-label">Grupo (opcional)</label>
        <select {...register('id_grupo')} className="field bg-white">
          <option value="">Sin grupo</option>
          {grupos.map((g) => (
            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo}</option>
          ))}
        </select>
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
