import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  username: z.string().min(1, 'Requerido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth  = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    try {
      const { token, user } = await authService.login(data)
      setAuth(token, user)
      toast.success(`Bienvenido, ${user.nombre}`)
      navigate('/')
    } catch {
      toast.error('Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--paper)' }}
    >
      {/* Decorative lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #00000008 39px, #00000008 40px)',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Header block */}
        <div
          className="bg-[var(--ink)] text-[var(--paper)] px-8 py-8"
          style={{ border: '3px solid var(--ink)' }}
        >
          <div className="font-display text-5xl font-black uppercase tracking-tight leading-none">
            EVAL
          </div>
          <div className="font-mono-brut text-xs text-gray-400 tracking-widest mt-2 uppercase">
            Sistema de Evaluaciones
          </div>
        </div>

        {/* Form block */}
        <div
          className="bg-white px-8 py-8 space-y-5"
          style={{
            border: '3px solid var(--ink)',
            borderTop: 'none',
            boxShadow: '6px 6px 0 var(--ink)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label className="field-label" htmlFor="username">Usuario</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username')}
                className="field"
                placeholder="tu_usuario"
                aria-invalid={!!errors.username}
              />
              {errors.username && <p className="field-error">{errors.username.message}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="field"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-acid w-full justify-center mt-2"
              style={{ fontSize: 15 }}
            >
              {loading ? 'Ingresando…' : 'Ingresar →'}
            </button>
          </form>

          <div
            className="font-mono-brut text-[10px] text-gray-400 text-center pt-2"
            style={{ borderTop: '2px solid #e5e5e5' }}
          >
            TecnmCelaya — TAP
          </div>
        </div>
      </div>
    </div>
  )
}
