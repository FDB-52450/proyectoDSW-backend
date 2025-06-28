import crypto from 'node:crypto'
import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'

export class Pedido {
  constructor(
    public tipoEntrega: string,
    public tipoPago: string,
    public fechaEntrega: Date,
    public detalle: Array<PedidoProd>,
    public estado = 'pendiente',
    public precioTotal = 0, // Questionable patch, maybe should be revised.
    public fechaPedido = new Date(),
    public id = crypto.randomInt(1000, 10000).toString()
  ) {
    this.precioTotal = this.calcularPrecioTotal()
  }

  public calcularPrecioTotal(): number {
    return this.detalle.reduce((total, item) => total + item.cantidad * item.precioUnidad, 0)
  }

  // TODO: Maybe add a method to update the order status?
}