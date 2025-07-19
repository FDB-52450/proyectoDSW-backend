import { Repository } from '../shared/repository.js'
import { PedidoProd } from './pedidoprod-entity.js'

// TODO: Remove this later and use a real database

import { ProductoRepository } from '../producto/producto-repository.js'

const productoRepository = new ProductoRepository()
const productos = productoRepository.findAll()

if (!productos) {
  throw new Error('No products found in the repository')
}

//

const pedidoProds = [
  new PedidoProd(2, productos[0]),
  new PedidoProd(1, productos[1]),
  new PedidoProd(4, productos[2]),
  new PedidoProd(3, productos[1]),
  new PedidoProd(1, productos[3]),
]

// TODO: Remove this later and use a real database

export class PedidoProdRepository {
  public findAll(): PedidoProd[] | undefined {
    return pedidoProds
  }
}