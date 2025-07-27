import { Producto } from './producto-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'

import { EntityManager} from '@mikro-orm/mysql'

export class ProductoRepository {
  constructor(
    private productoEm: EntityManager
  ) {}

  public async findAll(filters?: ProductoFilters): Promise<Producto[]> {
    const queryFilters: any = {}

    if (filters) {
      if (filters.precioMin) {
        queryFilters.precio = { $gte: filters.precioMin}
      }
      if (filters.precioMax) {
        queryFilters.precio = {...(queryFilters.precio || {}), $lte: filters.precioMax}
      }
      if (filters.stockMin) {
        queryFilters.stock = { $gte: filters.stockMin}
      }
      if (filters.stockMax) {
        queryFilters.stock = {...(queryFilters.stock || {}), $lte: filters.stockMax}
      }
      if (filters.nombre) {
        queryFilters.nombre = { $like: filters.nombre}
      }
      if (filters.destacado) {
        queryFilters.destacado = filters.destacado
      }

      // TODO: Check if filters.marca and filters.categoria should be uppercased or not (implemented as uppercased directly on database)

      if (filters.marca) {
        queryFilters.marca = { $like: filters.marca}
      }
      if (filters.categoria) {
        queryFilters.categoria = { $like: filters.categoria}
      }
    }

    return await this.productoEm.find(Producto, queryFilters, {populate: ['marca', 'categoria', 'imagenes']})
  }

  public async findOne(item: { id: number }): Promise<Producto | null> {
    return await this.productoEm.findOne(Producto, {id: item.id}, {populate: ['marca', 'categoria', 'imagenes']})
  }

  public async checkConstraint(item: Producto): Promise<boolean> {
    const productoConflict = await this.productoEm.findOne(Producto, {nombre: item.nombre})

    if (productoConflict) return true

    return false
  }

  public async add(item: Producto): Promise<Producto | null> {
    try {
      await this.productoEm.persistAndFlush(item)
      return item
    } catch (error) {
      return null
    }
  }

  public async update(item: Producto, imagesToKeep: string[]): Promise<Producto | null> {
    const producto = await this.findOne(item)

    if (producto) {
      const imagenesToKeep = producto.imagenes.filter(img => imagesToKeep.includes(img.url));
      const imagenesFinales = [...imagenesToKeep, ...item.imagenes]

      if (imagenesFinales.length === 0) {
        producto.imagenes.removeAll()
      } else {
        producto.handleImagenes(imagenesFinales)
      }

      const {imagenes, ...rest} = item

      Object.assign(producto, rest)

      try {
        await this.productoEm.flush()
      } catch {
        throw new Error()
      }
    }

    return producto
  }

  public async delete(item: { id: number }): Promise<Producto | null> {
    const producto = await this.findOne(item)

    if (producto) {
      await this.productoEm.removeAndFlush(producto)
    }

    return producto
  }
}