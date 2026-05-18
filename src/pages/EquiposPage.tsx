import { useState } from 'react'
import { Plus, Loader2, Users, Pencil, Trash2 } from 'lucide-react'
import { useEquipos, useCrearEquipo, useActualizarEquipo, useEliminarEquipo } from '@/hooks/useEquipos'
import { useGrupos } from '@/hooks/useGrupos'
import { useAuthStore } from '@/store/authStore'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EquipoForm from '@/components/equipos/EquipoForm'
import type { Equipo } from '@/types/equipos.types'

export default function EquiposPage() {
  const user      = useAuthStore((s) => s.user)
  const rol       = user?.rol ?? 'alumno'
  const canWrite  = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Equipo|null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Equipo|null>(null)
  const [idGrupoFiltro, setIdGrupoFiltro] = useState<number|undefined>()

  const { data: equipos = [], isLoading, isError } = useEquipos(idGrupoFiltro ? { id_grupo: idGrupoFiltro } : undefined)
  const { data: gruposData, isLoading: gruposLoading } = useGrupos(0, 100, '')
  const grupos = gruposData?.content ?? []

  const crear      = useCrearEquipo()
  const actualizar = useActualizarEquipo()
  const eliminar   = useEliminarEquipo()

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (eq: Equipo) => { setEditTarget(eq); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: any) => {
    if (editTarget) {
      await actualizar.mutateAsync({ id: editTarget.id_equipo, body: { nombre_equipo: values.nombre_equipo, id_grupo: values.id_grupo } })
    } else {
      await crear.mutateAsync({ ...values, id_alumno_creador: user?.id ?? 1 })
    }
    closeModal()
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-none">Equipos</h1>
          <p className="font-mono-brut text-xs text-gray-500 mt-1">
            {isLoading ? '—' : `${equipos.length} equipo(s)`}
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn btn-acid">
            <Plus size={14} strokeWidth={2.5} /> Nuevo equipo
          </button>
        )}
      </div>

      {/* Filtro grupo */}
      <div className="max-w-xs">
        <label className="field-label">Filtrar por grupo</label>
        <select
          value={idGrupoFiltro ?? ''}
          onChange={(e) => setIdGrupoFiltro(e.target.value ? Number(e.target.value) : undefined)}
          className="field bg-white"
        >
          <option value="">Todos los grupos</option>
          {grupos.map((g) => (
            <option key={g.id_grupo} value={g.id_grupo}>{g.nombre_grupo} — {g.nombre_materia}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-20 gap-2 text-gray-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="font-mono-brut text-sm">Cargando…</span>
          </div>
        )}

        {isError && !isLoading && (
          <div className="py-16 text-center">
            <p className="font-display text-2xl font-black uppercase text-red-500">Error al cargar</p>
          </div>
        )}

        {!isLoading && !isError && equipos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 flex items-center justify-center mb-4 text-gray-200" style={{ border: '3px solid #e5e5e5' }}>
              <Users size={28} strokeWidth={1.5} />
            </div>
            <p className="font-display text-2xl font-black uppercase text-gray-400">Sin equipos</p>
            <p className="font-mono-brut text-xs text-gray-400 mt-1">
              {idGrupoFiltro ? 'No hay equipos en ese grupo.' : 'Crea el primer equipo.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && equipos.length > 0 && (
          <div className="overflow-x-auto">
            <table className="brut-table">
              <thead>
                <tr>
                  <th>Nombre del equipo</th>
                  <th>Grupo</th>
                  <th>Integrantes</th>
                  {(canWrite || canDelete) && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {equipos.map((eq) => (
                  <tr key={eq.id_equipo}>
                    <td className="font-bold">{eq.nombre_equipo}</td>
                    <td className="text-gray-500 text-xs">{eq.nombre_grupo ?? `Grupo ${eq.id_grupo}`}</td>
                    <td>
                      <span className="font-mono-brut text-xs">{eq.total_integrantes ?? '—'}</span>
                    </td>
                    {(canWrite || canDelete) && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {canWrite && (
                            <button onClick={() => openEdit(eq)} className="btn btn-ghost btn-sm">
                              <Pencil size={12} strokeWidth={2.5} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(eq)} className="btn btn-danger btn-sm">
                              <Trash2 size={12} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(canWrite || canDelete) && (
        <>
          <Modal open={modalOpen} title={editTarget ? 'Editar equipo' : 'Nuevo equipo'} onClose={closeModal}>
            <EquipoForm
              key={editTarget?.id_equipo ?? 'new'}
              initial={editTarget}
              grupos={grupos}
              gruposLoading={gruposLoading}
              onSubmit={handleSubmit}
              loading={crear.isPending || actualizar.isPending}
              onCancel={closeModal}
            />
          </Modal>

          <ConfirmDialog
            open={!!deleteTarget}
            title="Eliminar equipo"
            message={`¿Eliminar el equipo "${deleteTarget?.nombre_equipo}"? Esta acción no se puede deshacer.`}
            loading={eliminar.isPending}
            onConfirm={async () => { await eliminar.mutateAsync(deleteTarget!.id_equipo); setDeleteTarget(null) }}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      )}
    </div>
  )
}
