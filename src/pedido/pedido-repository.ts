import { Repository } from '../shared/repository.js'
import { Pedido } from './pedido-entity.js'

const pedidos = [
  new Pedido(
    'RETIRO',
    'EFECTIVO',
    new Date(2025, 5, 25),
    new Date(2025, 5, 30),
    'pendiente',
  ),
]

export class PedidoRepository implements Repository<Pedido> {
  public findAll(): Pedido[] | undefined {
    return pedidos
  }

  public findOne(item: { id: string }): Pedido | undefined {
    return pedidos.find((pedido) => pedido.id === item.id)
  }

  public add(item: Pedido): Pedido | undefined {
    pedidos.push(item)
    return item
  }

  public update(item: Pedido): Pedido | undefined {
    const pedidoIdx = pedidos.findIndex((pedido) => pedido.id === item.id)

    if (pedidoIdx !== -1) {
      pedidos[pedidoIdx] = { ...pedidos[pedidoIdx], ...item }
    }
    return pedidos[pedidoIdx]
  }

  public delete(item: { id: string }): Pedido | undefined {
    const pedidoIdx = pedidos.findIndex((pedido) => pedido.id === item.id)

    if (pedidoIdx !== -1) {
      const deletedPedidos = pedidos[pedidoIdx]
      pedidos.splice(pedidoIdx, 1)
      return deletedPedidos
    }
  }
}