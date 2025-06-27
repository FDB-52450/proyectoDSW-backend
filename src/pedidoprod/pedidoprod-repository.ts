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

export class PedidoProdRepository implements Repository<PedidoProd> {
  public findAll(): PedidoProd[] | undefined {
    return pedidoProds
  }

  public findOne(item: { id: string }): PedidoProd | undefined {
    return pedidoProds.find((pedidoprod) => pedidoprod.id === item.id)
  }

  public add(item: PedidoProd): PedidoProd | undefined {
    pedidoProds.push(item)
    return item
  }

  public update(item: PedidoProd): PedidoProd | undefined {
    const pedidoprodIdx = pedidoProds.findIndex((pedidoprod) => pedidoprod.id === item.id)

    if (pedidoprodIdx !== -1) {
      pedidoProds[pedidoprodIdx] = { ...pedidoProds[pedidoprodIdx], ...item }
    }
    return pedidoProds[pedidoprodIdx]
  }

  public delete(item: { id: string }): PedidoProd | undefined {
    const pedidoprodIdx = pedidoProds.findIndex((pedidoprod) => pedidoprod.id === item.id)

    if (pedidoprodIdx !== -1) {
      const deletedPedidoProds = pedidoProds[pedidoprodIdx]
      pedidoProds.splice(pedidoprodIdx, 1)
      return deletedPedidoProds
    }
  }
}