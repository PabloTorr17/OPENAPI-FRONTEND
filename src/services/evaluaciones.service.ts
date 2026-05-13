import api from '@/services/api'
import type { Evaluacion, EvaluacionInput, Criterio } from '@/types/evaluaciones.types'

export const evaluacionesService = {
  // POST /evaluaciones — único endpoint disponible según el backend
  registrar: (body: EvaluacionInput) =>
    api.post<Evaluacion>('/evaluaciones', body).then((r) => r.data),

  // GET /criterios?id_exposicion=N  (ajusta si el endpoint cambia)
  obtenerCriterios: (id_exposicion: number) =>
    api.get<Criterio[]>('/criterios', { params: { id_exposicion } }).then((r) => r.data),
}