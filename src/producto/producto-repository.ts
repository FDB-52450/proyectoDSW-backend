import { Repository } from '../shared/repository.js'
import { Producto } from './producto-entity.js'
import { Marca } from '../marca/marca-entity.js'
import { Categoria } from '../categoria/categoria-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

import { Collection, EntityManager, SqlEntityManager } from '@mikro-orm/mysql'
import fs from 'fs'

// DELETE LATER
import { ImagenRepository } from '../imagen/imagen-repository.js'
import { MarcaRepository } from '../marca/marca-repository.js'
import { CategoriaRepository } from '../categoria/categoria-repository.js'

export class ProductoRepository /*implements Repository<Producto>*/ {
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
    return await this.productoEm.findOne(Producto, {id: item.id}, {populate: ['imagenes']})
  }

  public async add(item: Producto): Promise<Producto | null> {
    try {
      await this.productoEm.persistAndFlush(item)
      return item
    } catch (error) {
      item.imagenes.map((img: Imagen) => {
        if (img.url != "template.png") {fs.unlinkSync("images/" + img.url)}
      })
      return null
    }
  }

  public async update(item: Producto, data: any): Promise<Producto | null> {
    const producto = await this.findOne(item)

    if (producto) {
      Object.assign(producto, item)

      /*data.map((data: {operation: string, oldUrl?: string, newImageName?: string}) => {
        if (data.operation === 'add') {

          producto.imagenes.add()
        }
      })*/

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
      producto.imagenes.map((img: Imagen) => {
        if (img.url != "template.png") {fs.unlinkSync("images/" + img.url)}
      })
      await this.productoEm.removeAndFlush(producto)
    }

    return producto
  }

  public async createPedidos() {
    const imgRepo = new ImagenRepository(this.productoEm.fork())
    const catRepo = new CategoriaRepository(this.productoEm.fork())
    const marRepo = new MarcaRepository(this.productoEm.fork())

    const marca1 = await marRepo.findOne({id: 1})
    const marca2 = await marRepo.findOne({id: 2})
    const categoria1 = await catRepo.findOne({id: 3})
    const categoria2 = await catRepo.findOne({id: 3})
    const imagenGen = await imgRepo.findTemplate()

    const productos = [
      new Producto(
        'RTX 3060', 'Tarjeta grafica', 100000, 50,
        [imagenGen], marca1!, categoria1!
      ),
      new Producto(
        'RX 6700 XT', 'Tarjeta grafica AMD', 90000, 30,
        [imagenGen], marca2!, categoria1!
      ),
      new Producto(
        'Ryzen 7 5800X', 'Procesador de alto rendimiento', 120000, 20,
        [imagenGen], marca2!, categoria2!
      ),
      new Producto(
        'Core i7 12700K', 'Procesador Intel de 12va generación', 130000, 15,
        [imagenGen], marca1!, categoria2!
      )
    ]

    await this.productoEm.persistAndFlush(productos)
  }
}