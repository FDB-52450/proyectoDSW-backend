import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'
import { Producto } from './producto-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'

import { EntityManager} from '@mikro-orm/mysql'

export class ProductoRepository {
  constructor(
    private productoEm: EntityManager
  ) {}

  public async findAll(page: number, filters?: ProductoFilters): Promise<[Producto[], number]> {
    const queryFilters: any = {} 
    const pageSize = 20
    const offset = (page - 1) * pageSize

    if (filters) {
      if (filters.precioMin) {
        queryFilters.precioFinal = { $gte: filters.precioMin}
      }
      if (filters.precioMax) {
        queryFilters.precioFinal = {...(queryFilters.precioFinal || {}), $lte: filters.precioMax}
      }
      if (filters.stockMin) {
        queryFilters.stock = { $gte: filters.stockMin}
      }
      if (filters.stockMax) {
        queryFilters.stock = {...(queryFilters.stock || {}), $lte: filters.stockMax}
      }
      if (filters.nombre) {
        queryFilters.nombre = { $like: `%${filters.nombre}%`}
      }
      if (filters.destacado) {
        queryFilters.destacado = filters.destacado
      }
      if (filters.marca) {
        queryFilters.marca = { nombre: {$like: `%${filters.marca}%`} }
      }
      if (filters.categoria) {
        queryFilters.categoria = { nombre: {$like: `%${filters.categoria}%`} }
      }
    }

    let typeSort = {}

    if (filters?.sort) {
      switch (filters.sort) {
        case 'precio-asc': typeSort = {precioFinal: 'ASC', id: 'ASC'}; break;
        case 'precio-desc': typeSort = {precioFinal: 'DESC', id: 'ASC'}; break;
        case 'destacado': typeSort = {destacado: 'DESC', id: 'ASC'}; break;
        default: typeSort = { destacado: 'DESC', id: 'ASC' }; break;
      }
    } else {
      typeSort = {destacado: 'DESC', id: 'ASC'}
    }

    return await this.productoEm.findAndCount(Producto, queryFilters, {
      limit: pageSize,
      offset: offset,
      orderBy: typeSort,
      populate: ['marca', 'categoria', 'imagenes']
    })
  }

  public async findOne(item: { id: number }): Promise<Producto | null> {
    return await this.productoEm.findOne(Producto, {id: item.id}, {populate: ['marca', 'categoria', 'imagenes', 'marca.imagen']})
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

  public async update(item: Producto, imagesToRemove: string[]): Promise<Producto | null> {
    const producto = await this.findOne(item)

    if (producto) {
      const imagenesToKeep = producto.imagenes.filter(img => !imagesToRemove.includes(img.url));
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
        throw new Error('El producto no se ha actualizado con exito.')
      }
    }

    return producto
  }

  public async delete(item: { id: number }): Promise<Producto | null> {
    const producto = await this.findOne(item)
    const productoReferences = await this.productoEm.count(PedidoProd, {producto: producto})

    if (productoReferences > 0) {
      throw new Error('El producto es referenciado en otros pedidos.')
    }

    if (producto) {
      await this.productoEm.removeAndFlush(producto)
    }

    return producto
  }
}