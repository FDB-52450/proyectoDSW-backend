import { Repository } from '../shared/repository.js'
import { PedidoProd } from './pedidoprod-entity.js'

import { ProductoRepository } from '../producto/producto-repository.js'

import { Marca } from '../marca/marca-entity.js'
import { Categoria } from '../categoria/categoria-entity.js'
import { Producto } from '../producto/producto-entity.js'

const productos = [
  new Producto(
    'RTX 3060',
    'Tarjeta grafica',
    100000,
    0,
    50,
    10,
    false,
    new Date(2025, 5, 30),
    'pqwol23m3m21l2',
    new Marca('NVIDIA', '123'),
    new Categoria('placa-video')
  ),
]


const pedidoProds = [
  new PedidoProd(
    5,
    15000,
    productos[0]
  ),
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