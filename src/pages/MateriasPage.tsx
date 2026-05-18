import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useMaterias, useCrearMateria, useActualizarMateria, useEliminarMateria } from '@/hooks/useMaterias'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import type { Materia } from '@/services/materias.service'

const schema = z.object({
  clave_materia:  z.string().min(2).max(20),
  nombre_materia: z.string().min(3).max(100),
})
type FormValues = z.infer<typeof schema>
const PAGE_SIZE = 10

export default function MateriasPage() {
  const rol      = useAuthStore((s) => s.user?.rol)
  const canWrite = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [page, setPage]           = useState(0)
  const [search, setSearch]       = useState('')
  const [debounced, setDebounced] = useState('')
  const [timer, setTimer]         = useState<ReturnType<typeof setTimeout> | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Materia | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Materia | null>(null)

  const { data, isLoading } = useMaterias(page, PAGE_SIZE, debounced)
  const crear     = useCrearMateria()
  const actualizar = useActualizarMateria()
  const eliminar  = useEliminarMateria()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const handleSearch = (v: string) => {
    setSearch(v); setPage(0)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => setDebounced(v), 380))
  }

  const openCreate = () => { setEditing(null); reset({ clave_materia: '', nombre_materia: '' }); setModalOpen(true) }
  const openEdit   = (m: Materia) => { setEditing(m); reset({ clave_materia: m.clave_materia, nombre_materia: m.nombre_materia }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) { await actualizar.mutateAsync({ id: editing.id_materia, body: values }); toast.success('Materia actualizada') }
      else { await crear.mutateAsync(values); toast.success('Materia creada') }
      closeModal()
    } catch (err: any) { toast.error(err?.response?.data?.message ?? 'Error') }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-none">Materias</h1>
          <p className="font-mono-brut text-xs text-gray-500 mt-1">
            {data ? `${data.totalElements} registradas` : '—'}
          </p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn btn-acid">
            <Plus size={14} strokeWidth={2.5} /> Nueva materia
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={2.5} />
        <input
          type="search" value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar materia…"
          className="field pl-9"
        />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center font-mono-brut text-sm text-gray-400 animate-pulse">Cargando…</div>
        ) : data?.content.length === 0 ? (
          <EmptyState title="Sin materias" description={search ? `Sin resultados para "${search}"` : 'Registra la primera materia.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="brut-table">
              <thead>
                <tr>
                  <th>Clave</th>
                  <th>Nombre</th>
                  {(canWrite || canDelete) && <th style={{ textAlign: 'right' }}>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {data?.content.map((m) => (
                  <tr key={m.id_materia}>
                    <td><span className="font-mono-brut text-xs bg-gray-100 px-2 py-0.5">{m.clave_materia}</span></td>
                    <td className="font-medium">{m.nombre_materia}</td>
                    {(canWrite || canDelete) && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {canWrite && (
                            <button onClick={() => openEdit(m)} className="btn btn-ghost btn-sm">
                              <Pencil size={12} strokeWidth={2.5} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(m)} className="btn btn-danger btn-sm">
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

        {/* Pagination */}
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

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="panel w-full max-w-sm" style={{ animation: 'modalIn 120ms ease-out' }}>
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--ink)]">
              <h2 className="font-display text-xl font-black uppercase text-[var(--paper)]">
                {editing ? 'Editar materia' : 'Nueva materia'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 space-y-4">
              <div>
                <label className="field-label">Clave *</label>
                <input {...register('clave_materia')} className="field" placeholder="Ej. PROG-01" />
                {errors.clave_materia && <p className="field-error">{errors.clave_materia.message}</p>}
              </div>
              <div>
                <label className="field-label">Nombre *</label>
                <input {...register('nombre_materia')} className="field" placeholder="Ej. Programación Web" />
                {errors.nombre_materia && <p className="field-error">{errors.nombre_materia.message}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn btn-ghost flex-1 justify-center">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn flex-1 justify-center">
                  {isSubmitting ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
          <style>{`@keyframes modalIn{from{opacity:0;transform:translate(4px,8px)}to{opacity:1;transform:translate(0,0)}}`}</style>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar materia"
        message={`¿Eliminar "${deleteTarget?.nombre_materia}"? No se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={async () => { try { await eliminar.mutateAsync(deleteTarget!.id_materia); toast.success('Eliminada') } catch (e: any) { toast.error(e?.response?.data?.message ?? 'Error') } setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
