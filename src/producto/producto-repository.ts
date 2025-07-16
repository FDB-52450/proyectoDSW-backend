import { Repository } from '../shared/repository.js'
import { Producto } from './producto-entity.js'
import { Marca } from '../marca/marca-entity.js'
import { Categoria } from '../categoria/categoria-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

import fs from 'fs'

const marca1 = new Marca('NVIDIA', new Imagen('/test.jpg'))
const categoria1 = new Categoria('placa-video')
const marca2 = new Marca('AMD', new Imagen('/test.jpg'))
const categoria2 = new Categoria('procesador')

const imagenGen = [new Imagen()]

const productos = [
  new Producto(
    'RTX 3060',
    'Tarjeta grafica',
    100000,
    0,
    50,
    imagenGen,
    marca1,
    categoria1
  ),
  new Producto(
    'RX 6700 XT',
    'Tarjeta grafica AMD',
    90000,
    5,
    30,
    imagenGen,
    marca2,
    categoria1
  ),
  new Producto(
    'Ryzen 7 5800X',
    'Procesador de alto rendimiento',
    120000,
    10,
    20,
    imagenGen,
    marca2,
    categoria2
  ),
  new Producto(
    'Core i7 12700K',
    'Procesador Intel de 12va generación',
    130000,
    8,
    15,
    imagenGen,
    new Marca('Intel', new Imagen('/test.jpg')),
    categoria2
  )
]

export class ProductoRepository implements Repository<Producto> {
  public findAll(filters?: ProductoFilters): Producto[] | undefined {
    // TODO: Try to clean up this code (ideally the second return result shouldn't be necessary)

    let result = productos

    if (!filters) return result

    if (filters.precioMin) {
      result = result.filter(p => p.precio >= filters.precioMin!)
    }
    if (filters.precioMax) {
      result = result.filter(p => p.precio <= filters.precioMax!)
    }
    if (filters.stockMin) {
      result = result.filter(p => p.stock >= filters.stockMin!)
    }
    if (filters.stockMax) {
      result = result.filter(p => p.stock <= filters.stockMax!)
    }
    if (filters.nombre) {
      result = result.filter(p => p.nombre.toLowerCase().includes(filters.nombre!.toLowerCase()))
    }
    if (filters.destacado) {
      result = result.filter(p => p.destacado === filters.destacado)
    }

    // TODO: Check if filters.marca and filters.categoria should be uppercased or not (implemented as uppercased directly on database)

    if (filters.marca) {
      result = result.filter(p => p.marca.nombre.toUpperCase() === filters.marca)
    }
    if (filters.categoria) {
      result = result.filter(p => p.categoria.nombre.toUpperCase() === filters.categoria)
    }

    return result
  }

  public findOne(item: { id: string }): Producto | undefined {
    return productos.find((producto) => producto.id === item.id)
  }
 
  public findByMarca(filter: Marca): Producto[] | undefined {
    return productos.filter((producto) => producto.marca === filter)
  }

  public findByCategoria(filter: Categoria): Producto[] | undefined {
    return productos.filter((producto) => producto.categoria === filter)
  }

  public add(item: Producto): Producto | undefined {
    productos.push(item)
    
    return item
  }

  public update(item: Producto): Producto | undefined {
    const productoIdx = productos.findIndex((producto) => producto.id === item.id)

    if (productoIdx !== -1) {
      Object.assign(productos[productoIdx], item)
    }

    return productos[productoIdx]
  }

  public updateImages(): Producto | undefined {
    return 
  }

  public delete(item: { id: string }): Producto | undefined {
    const productoIdx = productos.findIndex((producto) => producto.id === item.id)

    if (productoIdx !== -1) {
      const deletedProducto = productos[productoIdx]
      deletedProducto.imagenes.map((imagen: Imagen) => {fs.unlinkSync("images/" + imagen.url)})
      productos.splice(productoIdx, 1)

      return deletedProducto
    }
  }
}