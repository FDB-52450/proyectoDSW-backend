import { Repository } from '../shared/repository.js'
import { Pedido } from './pedido-entity.js'
import { EntityManager } from '@mikro-orm/mysql'

export class PedidoRepository /*implements Repository<Pedido>*/ {
  constructor(
    private pedidoEm: EntityManager
  ) {}

  public async findAll(): Promise<Pedido[]> {
    return await this.pedidoEm.findAll(Pedido, {populate: ['detalle', 'detalle.producto']})
  }

  public async findOne(item: { id: number }): Promise<Pedido | null> {
    return await this.pedidoEm.findOne(Pedido, {id: item.id}, {populate: ['detalle', 'detalle.producto']})
  }

  public async add(item: Pedido): Promise<Pedido | null> {
    try {
      await this.pedidoEm.persistAndFlush(item)
      return item
    } catch (err) {
      return null
    }
  }

  public async update(item: Pedido): Promise<Pedido | null> {
    const pedido = await this.findOne(item)

    if (pedido) {
      const result = this.cambiarEstado(pedido, item)

      if (result) {
        pedido.estado = item.estado
        await this.pedidoEm.flush()
      } else {
        throw new Error()
      }
    }

    return pedido
  }

  public cambiarEstado(pedidoViejo: Pedido, pedidoNuevo: Pedido) {  
    if (pedidoViejo.estado === 'pendiente') {
      if (pedidoNuevo.estado === 'confirmado' || pedidoNuevo.estado === 'cancelado') {
        pedidoViejo.reducirStockReservado()

        if (pedidoNuevo.estado === 'confirmado') {
          pedidoViejo.reducirStock()
        }

        return true
      }
    }
    return false 
  }

  public async delete(item: { id: number }): Promise<Pedido | null> {
    const pedido = await this.findOne(item)

    if (pedido) {
      await this.pedidoEm.removeAndFlush(pedido)
    }

    return pedido
  }
}