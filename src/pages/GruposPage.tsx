import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'
import { useGrupos, useCrearGrupo, useActualizarGrupo } from '@/hooks/useGrupos'
import { materiasService } from '@/services/materias.service'
import { useQuery } from '@tanstack/react-query'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import type { Grupo } from '@/services/grupos.service'

const SEMESTRES = ['1°','2°','3°','4°','5°','6°','7°','8°','9°','10°']
const schema = z.object({
  nombre_grupo: z.string().min(2,'Mínimo 2').max(100),
  semestre:     z.string().min(1,'Selecciona semestre'),
  id_materia:   z.coerce.number().min(1,'Selecciona materia'),
})
type FormValues = z.infer<typeof schema>
const PAGE_SIZE = 10

export default function GruposPage() {
  const rol       = useAuthStore((s) => s.user?.rol)
  const canWrite  = rol === 'admin' || rol === 'docente'
  const canDelete = rol === 'admin'

  const [page, setPage]           = useState(0)
  const [search, setSearch]       = useState('')
  const [debounced, setDebounced] = useState('')
  const [timer, setTimer]         = useState<ReturnType<typeof setTimeout>|null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState<Grupo|null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Grupo|null>(null)

  const { data, isLoading } = useGrupos(page, PAGE_SIZE, debounced)
  const crear      = useCrearGrupo()
  const actualizar = useActualizarGrupo()
  // const eliminar   = useEliminarGrupo()

  const { data: materiasData } = useQuery({
    queryKey: ['materias-select'],
    queryFn: () => materiasService.listar({ page: 0, size: 100 }),
    enabled: modalOpen,
  })
  const materias = materiasData?.content ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const handleSearch = (v: string) => {
    setSearch(v); setPage(0)
    if (timer) clearTimeout(timer)
    setTimer(setTimeout(() => setDebounced(v), 380))
  }

  const openCreate = () => { setEditing(null); reset({ nombre_grupo:'', semestre:'', id_materia:0 }); setModalOpen(true) }
  const openEdit   = (g: Grupo) => { setEditing(g); reset({ nombre_grupo:g.nombre_grupo, semestre:g.semestre, id_materia:g.id_materia }); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) { await actualizar.mutateAsync({ id: editing.id_grupo, body: values }); toast.success('Grupo actualizado') }
      else { await crear.mutateAsync(values); toast.success('Grupo creado') }
      closeModal()
    } catch (err: any) { toast.error(err?.response?.data?.message ?? 'Error') }
  }

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight leading-none">Grupos</h1>
          <p className="font-mono-brut text-xs text-gray-500 mt-1">{data ? `${data.totalElements} registrados` : '—'}</p>
        </div>
        {canWrite && (
          <button onClick={openCreate} className="btn btn-acid">
            <Plus size={14} strokeWidth={2.5} /> Nuevo grupo
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" strokeWidth={2.5} />
        <input type="search" value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar grupo…" className="field pl-9" />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center font-mono-brut text-sm text-gray-400 animate-pulse">Cargando…</div>
        ) : data?.content.length === 0 ? (
          <EmptyState title="Sin grupos" description="No hay grupos con ese filtro." />
        ) : (
          <div className="overflow-x-auto">
            <table className="brut-table">
              <thead><tr>
                <th>Nombre</th><th>Semestre</th><th>Materia</th><th>Alumnos</th>
                {(canWrite||canDelete) && <th style={{textAlign:'right'}}>Acciones</th>}
              </tr></thead>
              <tbody>
                {data?.content.map((g) => (
                  <tr key={g.id_grupo}>
                    <td className="font-bold">{g.nombre_grupo}</td>
                    <td><span className="badge">{g.semestre}</span></td>
                    <td className="text-gray-600 text-xs">{g.nombre_materia}</td>
                    <td><span className="font-mono-brut text-xs">{g.alumnos?.length ?? 0}</span></td>
                    {(canWrite||canDelete) && (
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {canWrite && <button onClick={() => openEdit(g)} className="btn btn-ghost btn-sm"><Pencil size={12} /></button>}
                          {canDelete && <button onClick={() => setDeleteTarget(g)} className="btn btn-danger btn-sm"><Trash2 size={12} /></button>}
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
          <div className="flex items-center justify-between px-4 py-3" style={{borderTop:'2px solid var(--ink)'}}>
            <span className="font-mono-brut text-xs text-gray-500">Pág. {page+1} / {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(0,p-1))} disabled={page===0} className="btn btn-ghost btn-sm"><ChevronLeft size={14}/></button>
              <button onClick={() => setPage((p) => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className="btn btn-ghost btn-sm"><ChevronRight size={14}/></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target===e.currentTarget && closeModal()}>
          <div className="panel w-full max-w-sm" style={{animation:'modalIn 120ms ease-out'}}>
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--ink)]">
              <h2 className="font-display text-xl font-black uppercase text-[var(--paper)]">{editing ? 'Editar grupo' : 'Nuevo grupo'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-5 space-y-4">
              <div>
                <label className="field-label">Nombre *</label>
                <input {...register('nombre_grupo')} className="field" placeholder="Ej. Grupo A"/>
                {errors.nombre_grupo && <p className="field-error">{errors.nombre_grupo.message}</p>}
              </div>
              <div>
                <label className="field-label">Semestre *</label>
                <select {...register('semestre')} className="field bg-white">
                  <option value="">Selecciona</option>
                  {SEMESTRES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.semestre && <p className="field-error">{errors.semestre.message}</p>}
              </div>
              <div>
                <label className="field-label">Materia *</label>
                <select {...register('id_materia')} className="field bg-white">
                  <option value={0}>Selecciona materia</option>
                  {materias.map((m) => <option key={m.id_materia} value={m.id_materia}>{m.clave_materia} — {m.nombre_materia}</option>)}
                </select>
                {errors.id_materia && <p className="field-error">{errors.id_materia.message}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn btn-ghost flex-1 justify-center">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="btn flex-1 justify-center">{isSubmitting ? 'Guardando…' : editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
          <style>{`@keyframes modalIn{from{opacity:0;transform:translate(4px,8px)}to{opacity:1;transform:translate(0,0)}}`}</style>
        </div>
      )}

      {/* Confirm Dialog */}
      {/* <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar grupo"
        message={`¿Eliminar el grupo "${deleteTarget?.nombre_grupo}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
        onConfirm={async () => {
          try { await eliminar.mutateAsync(deleteTarget!.id_grupo); toast.success('Grupo eliminado') }
          catch (e: any) { toast.error(e?.response?.data?.message ?? 'Error') }
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      /> */}
    </div>
  )
}
