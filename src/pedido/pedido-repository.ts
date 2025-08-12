import { Repository } from '../shared/repository.js'
import { Pedido } from './pedido-entity.js'
import { EntityManager } from '@mikro-orm/mysql'

export class PedidoRepository implements Repository<Pedido> {
  constructor(
    private pedidoEm: EntityManager
  ) {}

  public async findAll(): Promise<Pedido[]> {
    return await this.pedidoEm.findAll(Pedido, {populate: ['detalle', 'detalle.producto', 'cliente']})
  }

  public async findOne(item: { id: number }): Promise<Pedido | null> {
    return await this.pedidoEm.findOne(Pedido, {id: item.id}, {populate: ['detalle', 'detalle.producto', 'cliente']})
  }

  public async add(item: Pedido): Promise<Pedido | null> {
    item.aumentarStockReservado()

    try {
      this.persistProdChanges(item)
      await this.pedidoEm.persistAndFlush(item)
      return item
    } catch (err) {
      return null
    }
  }

  public async update(item: Pedido): Promise<Pedido | null> {
    const pedido = await this.findOne(item)

    if (pedido) {
      let result = true
      
      if (item.estado) {
        result = this.cambiarEstado(pedido, item)
      }

      if (result) {
        Object.assign(pedido, item)
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

        this.persistProdChanges(pedidoViejo)

        return true
      }
    }
    return false 
  }

  public persistProdChanges(item: Pedido) {
    // FIX: This was added due to some issues regarding persistAndFlush(item) not updating reserved stock properly.
    item.detalle.getItems().forEach(itemProd => {
      this.pedidoEm.persist(itemProd.producto)
    })
  }

  public async delete(item: { id: number }): Promise<Pedido | null> {
    // DONT USE THIS.
    const pedido = await this.findOne(item)

    if (pedido) {
      await this.pedidoEm.removeAndFlush(pedido)
    }

    return pedido
  }

    public async findPedidosDataByCliente(clienteId?: number, estado?: string) {
        let query = `select cli.id as cliId, COUNT(*) as totalPedidos, SUM(ped.precio_total) as totalSuma 
        from pedido as ped inner join cliente as cli on ped.cliente_id = cli.id`

        if (clienteId !== undefined) {
            query += ` where cli.id = '${clienteId}'`
        }

        if (estado !== undefined) {
            if (clienteId !== undefined) {
                query += ` and estado = '${estado}'`
            }
            query += ` where estado = '${estado}'`
        }

        query += ' group by cli.id'

        const result = await this.pedidoEm.execute(query)

        const pedidoData = result.map(item => ({
            clienteId: item.cliId,
            cantPedidos: item.totalPedidos,
            totalPedidos: Number(item.totalSuma)
        }))
    
        return pedidoData
    }
}