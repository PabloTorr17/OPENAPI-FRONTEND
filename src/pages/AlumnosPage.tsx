import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useAlumnos, useCrearAlumno, useActualizarAlumno, useEliminarAlumno } from '@/hooks/useAlumnos'
import AlumnoForm from '@/components/alumnos/AlumnoForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import { useAuthStore } from '@/store/authStore'
import type { Alumno } from '@/types/alumnos.types'

export default function AlumnosPage() {
  const rol       = useAuthStore((s) => s.user?.rol)
  const canWrite  = rol === 'admin' || rol === 'docente'

  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(0)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Alumno|null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Alumno|null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useAlumnos({ search, page, size: PAGE_SIZE })
  const crear      = useCrearAlumno()
  const actualizar = useActualizarAlumno()
  const eliminar   = useEliminarAlumno()

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (a: Alumno) => { setEditTarget(a); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: any) => {
    const body = { ...values }
    if (editTarget && !body.password) delete body.password
    if (editTarget) await actualizar.mutateAsync({ id: editTarget.id_alumno, body })
    else await crear.mutateAsync(body)
    closeModal()
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-none">Alumnos</h1>
          <p className="font-mono-brut text-xs text-gray-500 mt-1">
            {data ? `${data.totalElements} registrados` : '—'}
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn btn-acid">
            <Plus size={14} strokeWidth={2.5} /> Nuevo alumno
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={2.5} />
        <input
          type="search" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Buscar nombre o matrícula…"
          className="field pl-9"
        />
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
            <p className="font-mono-brut text-xs text-gray-400 mt-1">Verifica tu conexión</p>
          </div>
        )}

        {!isLoading && !isError && data?.content.length === 0 && (
          <EmptyState
            title="Sin alumnos"
            description={search ? `Sin resultados para "${search}"` : 'Registra el primer alumno.'}
            action={search ? (
              <button onClick={() => setSearch('')} className="btn btn-ghost btn-sm">Limpiar búsqueda</button>
            ) : undefined}
          />
        )}

        {!isLoading && !isError && (data?.content.length ?? 0) > 0 && (
          <div className="overflow-x-auto">
            <table className="brut-table">
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Grupo</th>
                  {canWrite && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {data!.content.map((a) => (
                  <tr key={a.id_alumno}>
                    <td>
                      <span className="font-mono-brut text-xs bg-gray-100 px-2 py-0.5">{a.matricula}</span>
                    </td>
                    <td className="font-bold">
                      {a.nombre} {a.apellido_pat} {a.apellido_mat ?? ''}
                    </td>
                    <td className="text-gray-500 text-xs">{a.email}</td>
                    <td>
                      {a.nombre_grupo
                        ? <span className="badge">{a.nombre_grupo}</span>
                        : <span className="font-mono-brut text-xs text-gray-300">—</span>
                      }
                    </td>
                    {canWrite && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(a)} className="btn btn-ghost btn-sm" aria-label="Editar">
                            <Pencil size={12} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => setDeleteTarget(a)} className="btn btn-danger btn-sm" aria-label="Eliminar">
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '2px solid var(--ink)' }}>
            <span className="font-mono-brut text-xs text-gray-500">Pág. {page + 1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-ghost btn-sm">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn btn-ghost btn-sm">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {canWrite && (
        <>
          <Modal open={modalOpen} title={editTarget ? 'Editar alumno' : 'Registrar alumno'} onClose={closeModal} size="md">
            <AlumnoForm
              initial={editTarget}
              onSubmit={handleSubmit}
              loading={crear.isPending || actualizar.isPending}
              onCancel={closeModal}
            />
          </Modal>

          <ConfirmDialog
            open={!!deleteTarget}
            title="Eliminar alumno"
            message={`¿Eliminar a ${deleteTarget?.nombre} ${deleteTarget?.apellido_pat}? Esta acción no se puede deshacer.`}
            loading={eliminar.isPending}
            onConfirm={async () => {
              await eliminar.mutateAsync(deleteTarget!.id_alumno)
              setDeleteTarget(null)
            }}
            onCancel={() => setDeleteTarget(null)}
          />
        </>
      )}
    </div>
  )
}
