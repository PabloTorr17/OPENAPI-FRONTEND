export interface Exposicion {
  id_exposicion: number
  tema: string
  fecha: string
  id_equipo: number
  nombre_equipo?: string
}

export interface ExposicionInput {
  tema: string
  fecha: string
  id_equipo: number
}

export interface PagedExposiciones {
  page: number
  size: number
  totalElements: number
  totalPages: number
  content: Exposicion[]
}

export interface ExposicionesFiltros {
  search: string
  page: number
  size: number
}