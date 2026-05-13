import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { equiposService } from '@/services/equipos.service'
import type { EquipoInput, EquiposFiltros } from '@/types/equipos.types'

export const EQUIPOS_KEY = 'equipos'

export function useEquipos(filtros?: EquiposFiltros) {
  return useQuery({
    queryKey: [EQUIPOS_KEY, filtros],
    queryFn: () => equiposService.listar(filtros),
  })
}

export function useCrearEquipo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EquipoInput) => equiposService.crear(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EQUIPOS_KEY] })
      toast.success('Equipo creado')
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? 'Error al crear equipo'),
  })
}