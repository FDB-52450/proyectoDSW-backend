// TODO: Determine if this should be an interface or a class

export interface ProductoFilters {
  precioMin?: number
  precioMax?: number
  stockMin?: number
  stockMax?: number
  nombre?: string
  destacado?: boolean
  marca?: string
  categoria?: string
}