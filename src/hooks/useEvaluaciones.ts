import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { evaluacionesService } from '@/services/evaluaciones.service'
import type { EvaluacionInput } from '@/types/evaluaciones.types'

export const EVALUACIONES_KEY = 'evaluaciones'
export const CRITERIOS_KEY    = 'criterios'

export function useEvaluaciones(params: { page: number; size: number; id_exposicion?: number }) {
  return useQuery({
    queryKey: [EVALUACIONES_KEY, params],
    queryFn:  () => evaluacionesService.listar(params),
    placeholderData: (prev) => prev,
  })
}

export function useCriterios(id_exposicion: number | null) {
  return useQuery({
    queryKey: [CRITERIOS_KEY, id_exposicion],
    queryFn:  () => evaluacionesService.obtenerCriterios(id_exposicion!),
    enabled:  !!id_exposicion,
  })
}

export function useRegistrarEvaluacion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: EvaluacionInput) => evaluacionesService.registrar(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EVALUACIONES_KEY] })
      toast.success('Evaluación registrada correctamente')
    },
    onError: (err: any) => {
      const status  = err?.response?.status
      const message = err?.response?.data?.message
      // 409: evaluación duplicada (definido en el OpenAPI)
      if (status === 409) {
        toast.error(message ?? 'Ya registraste una evaluación para esta exposición')
      } else {
        toast.error(message ?? 'Error al registrar la evaluación')
      }
    },
  })
}