import api from '@/services/api'
import type { Equipo, EquipoInput } from '@/types/equipos.types'

const BASE = '/equipos'

export const equiposService = {
  // GET /equipos?id_grupo=N  → Equipo[]  (array directo, sin paginación)
  listar: (params?: { id_grupo?: number }) =>
    api.get<Equipo[]>(BASE, { params }).then((r) => r.data),

  crear: (body: EquipoInput) =>
    api.post<Equipo>(BASE, body).then((r) => r.data),
}