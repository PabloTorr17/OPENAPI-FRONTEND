import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useExposiciones, useCrearExposicion, useActualizarExposicion, useEliminarExposicion } from '@/hooks/useExposiciones'
import ExposicionForm from '@/components/exposiciones/ExposicionForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import type { Exposicion } from '@/types/exposiciones.types'

function fmt(iso: string) {
  try { return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso)) }
  catch { return iso }
}

function StatusBadge({ fecha }: { fecha: string }) {
  const diff = new Date(fecha).getTime() - Date.now()
  if (diff < 0)          return <span className="badge" style={{ background: '#f3f4f6', borderColor: '#9ca3af', color: '#6b7280' }}>Realizada</span>
  if (diff < 86_400_000) return <span className="badge" style={{ background: '#fef9c3', borderColor: '#ca8a04', color: '#92400e' }}>Hoy</span>
  return                        <span className="badge" style={{ background: 'var(--acid)', borderColor: 'var(--ink)', color: 'var(--ink)' }}>Próxima</span>
}

export default function ExposicionesPage() {
  const [search, setSearch]             = useState('')
  const [page, setPage]                 = useState(0)
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState<Exposicion|null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Exposicion|null>(null)
  const PAGE_SIZE = 10

  const { data, isLoading, isError } = useExposiciones({ search, page, size: PAGE_SIZE })
  const crear      = useCrearExposicion()
  const actualizar = useActualizarExposicion()
  const eliminar   = useEliminarExposicion()

  const openCreate = () => { setEditTarget(null); setModalOpen(true) }
  const openEdit   = (e: Exposicion) => { setEditTarget(e); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditTarget(null) }

  const handleSubmit = async (values: any) => {
    const body = { ...values }
    if (!body.descripcion) delete body.descripcion
    if (editTarget) await actualizar.mutateAsync({ id: editTarget.id_exposicion, body })
    else await crear.mutateAsync(body)
    closeModal()
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-none">Exposiciones</h1>
          <p className="font-mono-brut text-xs text-gray-500 mt-1">{data ? `${data.totalElements} registradas` : '—'}</p>
        </div>
        <button onClick={openCreate} className="btn" style={{ background: '#7c3aed', borderColor: 'var(--ink)', color: '#fff' }}>
          <Plus size={14} strokeWidth={2.5} /> Nueva exposición
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={2.5} />
        <input
          type="search" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          placeholder="Buscar por título…" className="field pl-9"
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
          </div>
        )}
        {!isLoading && !isError && data?.content.length === 0 && (
          <EmptyState title="Sin exposiciones" description={search ? `Sin resultados para "${search}"` : 'Registra la primera exposición.'} />
        )}
        {!isLoading && !isError && (data?.content.length ?? 0) > 0 && (
          <div className="overflow-x-auto">
            <table className="brut-table">
              <thead>
                <tr>
                  <th>Título</th><th>Fecha</th><th>Equipo</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data!.content.map((expo) => (
                  <tr key={expo.id_exposicion}>
                    <td className="font-bold max-w-xs">
                      <span className="block truncate">{expo.titulo}</span>
                    </td>
                    <td className="font-mono-brut text-xs whitespace-nowrap">{fmt(expo.fecha_exposicion)}</td>
                    <td className="text-gray-500 text-xs">{expo.nombre_equipo ?? `Equipo ${expo.id_equipo}`}</td>
                    <td><StatusBadge fecha={expo.fecha_exposicion} /></td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(expo)} className="btn btn-ghost btn-sm"><Pencil size={12} /></button>
                        <button onClick={() => setDeleteTarget(expo)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
                      </div>
                    </td>
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
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-ghost btn-sm"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn btn-ghost btn-sm"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} title={editTarget ? 'Editar exposición' : 'Nueva exposición'} onClose={closeModal} size="lg">
        <ExposicionForm initial={editTarget} onSubmit={handleSubmit}
          loading={crear.isPending || actualizar.isPending} onCancel={closeModal} />
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar exposición"
        message={`¿Eliminar "${deleteTarget?.titulo}"? No se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={async () => { await eliminar.mutateAsync(deleteTarget!.id_exposicion); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
