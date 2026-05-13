import api from '@/services/api'
import type { Evaluacion, EvaluacionInput, PagedEvaluaciones, Criterio } from '@/types/evaluaciones.types'

export const evaluacionesService = {
  // POST /evaluaciones — exacto según OpenAPI
  registrar: (body: EvaluacionInput) =>
    api.post<Evaluacion>('/evaluaciones', body).then((r) => r.data),

  listar: (params: { page: number; size: number; id_exposicion?: number }) =>
    api.get<PagedEvaluaciones>('/evaluaciones', { params }).then((r) => r.data),

  obtener: (id: number) =>
    api.get<Evaluacion>(`/evaluaciones/${id}`).then((r) => r.data),

  // Criterios de la rúbrica para una exposición
  obtenerCriterios: (id_exposicion: number) =>
    api.get<Criterio[]>('/criterios', { params: { id_exposicion } }).then((r) => r.data),
}