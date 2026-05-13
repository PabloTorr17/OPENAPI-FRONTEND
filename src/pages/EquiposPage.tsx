import { useState } from 'react'
import { Plus, Loader2, Users, Filter } from 'lucide-react'
import { useEquipos, useCrearEquipo } from '@/hooks/useEquipos'
import Modal from '@/components/ui/Modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  nombre_equipo:      z.string().min(2, 'Mínimo 2 caracteres').max(80),
  id_grupo:           z.number({ coerce: true }).positive('Requerido'),
  id_alumno_creador:  z.number({ coerce: true }).positive('Requerido'),
})
type FormValues = z.infer<typeof schema>

function EquipoForm({ onSubmit, loading, onCancel }: {
  onSubmit: (v: FormValues) => void
  loading?: boolean
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })
  const field = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all'
  const lbl   = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500'
  const err   = 'mt-1 text-xs text-red-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className={lbl} htmlFor="nombre_equipo">Nombre del equipo *</label>
        <input id="nombre_equipo" {...register('nombre_equipo')} className={field}
          placeholder="Ej. Equipo Alpha" aria-invalid={!!errors.nombre_equipo} />
        {errors.nombre_equipo && <p className={err} role="alert">{errors.nombre_equipo.message}</p>}
      </div>
      <div>
        <label className={lbl} htmlFor="id_grupo">ID de Grupo *</label>
        <input id="id_grupo" type="number" {...register('id_grupo')} className={field}
          placeholder="ID del grupo" aria-invalid={!!errors.id_grupo} />
        {errors.id_grupo && <p className={err} role="alert">{errors.id_grupo.message}</p>}
      </div>
      <div>
        <label className={lbl} htmlFor="id_alumno_creador">Tu ID de alumno (creador) *</label>
        <input id="id_alumno_creador" type="number" {...register('id_alumno_creador')} className={field}
          placeholder="Tu ID" aria-invalid={!!errors.id_alumno_creador} />
        {errors.id_alumno_creador && <p className={err} role="alert">{errors.id_alumno_creador.message}</p>}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition-colors">
          {loading ? 'Creando…' : 'Crear equipo'}
        </button>
      </div>
    </form>
  )
}

export default function EquiposPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [idGrupoFiltro, setIdGrupoFiltro] = useState('')

  const filtro = idGrupoFiltro ? { id_grupo: Number(idGrupoFiltro) } : undefined
  const { data: equipos = [], isLoading, isError } = useEquipos(filtro)
  const crear = useCrearEquipo()

  const handleSubmit = async (values: FormValues) => {
    await crear.mutateAsync(values)
    setModalOpen(false)
  }

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Equipos</h1>
          <p className="text-sm text-slate-500">
            {isLoading ? 'Cargando…' : `${equipos.length} equipo(s)`}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm">
          <Plus size={16} /> Nuevo equipo
        </button>
      </div>

      {/* Filtro por grupo */}
      <div className="flex items-center gap-2 max-w-xs">
        <Filter size={15} className="text-slate-400 shrink-0" />
        <input
          type="number"
          value={idGrupoFiltro}
          onChange={(e) => setIdGrupoFiltro(e.target.value)}
          placeholder="Filtrar por ID de grupo"
          aria-label="Filtrar equipos por grupo"
          className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
        />
        {idGrupoFiltro && (
          <button onClick={() => setIdGrupoFiltro('')}
            className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2 whitespace-nowrap">
            Limpiar
          </button>
        )}
      </div>

      {/* Contenido */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Cargando equipos…</span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-red-500">Error al cargar los datos</p>
            <p className="text-xs text-slate-400 mt-1">Verifica tu conexión o recarga la página</p>
          </div>
        )}

        {!isLoading && !isError && equipos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 h-14 w-14 rounded-full bg-teal-50 flex items-center justify-center">
              <Users size={24} className="text-teal-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Sin equipos</p>
            <p className="text-xs text-slate-400 mt-1">
              {idGrupoFiltro ? `No hay equipos en el grupo ${idGrupoFiltro}` : 'Crea el primer equipo.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && equipos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Tabla de equipos">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  {['Nombre del equipo', 'Grupo', 'Integrantes'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {equipos.map((eq) => (
                  <tr key={eq.id_equipo} className="hover:bg-teal-50/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{eq.nombre_equipo}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {eq.nombre_grupo ?? `Grupo ${eq.id_grupo}`}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {eq.total_integrantes ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Nuevo equipo" onClose={() => setModalOpen(false)}>
        <EquipoForm
          onSubmit={handleSubmit}
          loading={crear.isPending}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}