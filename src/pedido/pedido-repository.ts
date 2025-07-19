import { Repository } from '../shared/repository.js'
import { Pedido } from './pedido-entity.js'

import { PedidoProdRepository } from '../pedidoprod/pedidoprod-repository.js'

const pedidoProdRepository = new PedidoProdRepository()
const pedidoProds = pedidoProdRepository.findAll()

if (!pedidoProds) {
  throw new Error('No pedido products found in the repository')
}

const pedidos = [
  new Pedido(
    'RETIRO',
    'EFECTIVO',
    new Date(2025, 5, 30),
    [pedidoProds[0], pedidoProds[1]]
  ),
  new Pedido(
    'ENVIO',
    'TARJETA',
    new Date(2025, 6, 5),
    [pedidoProds[2]]
  ),
  new Pedido(
    'RETIRO',
    'TRANSFERENCIA',
    new Date(2025, 6, 10),
    [pedidoProds[3]]
  ),
  new Pedido(
    'ENVIO',
    'EFECTIVO',
    new Date(2025, 6, 15),
    [pedidoProds[4]]
  ),
]

export class PedidoRepository implements Repository<Pedido> {
  public findAll(): Pedido[] | undefined {
    return pedidos
  }

  public findOne(item: { id: number }): Pedido | undefined {
    return pedidos.find((pedido) => pedido.id === item.id)
  }

  public add(item: Pedido): Pedido | undefined {
    pedidos.push(item)
    return item
  }

  // TODO: Determine if an extra method for updating only the state is neccessary

  public update(item: Pedido): Pedido | undefined {
    const pedidoIdx = pedidos.findIndex((pedido) => pedido.id === item.id)

    if (pedidoIdx !== -1) {
      Object.assign(pedidos[pedidoIdx], item)
      pedidos[pedidoIdx].calcularPrecioTotal()
    }

    return pedidos[pedidoIdx]
  }

  public delete(item: { id: number }): Pedido | undefined {
    const pedidoIdx = pedidos.findIndex((pedido) => pedido.id === item.id)

    if (pedidoIdx !== -1) {
      const deletedPedidos = pedidos[pedidoIdx]
      pedidos.splice(pedidoIdx, 1)
      return deletedPedidos
    }
  }
}