import crypto from 'node:crypto'
import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'

export class Pedido {
  constructor(
    public tipoEntrega: string,
    public tipoPago: string,
    public fechaPedido: Date,
    public fechaEntrega: Date,
    public estado: string,
    public precioTotal = 0,
    public detalle = new Array<PedidoProd>(),
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}