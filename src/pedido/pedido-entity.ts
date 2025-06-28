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
    this.aumentarStockReservado()
  }

  public calcularPrecioTotal(): number {
    return this.detalle.reduce((total, item) => total + item.cantidad * item.precioUnidad, 0)
  }

  public checkDetalle(): boolean {
    return this.detalle.every(item => item.checkStock())
  }

  public actualizarEstado(nuevoEstado: string): void {
    // TODO: Complete this method; should include logic to increase/decrease stock accordingly.
  }

  // TODO: Determine if this string of methods from pedido to product is even necessary.

  public aumentarStockReservado(): void {
    this.detalle.forEach(item => {
      item.aumentarStockReservado()
    })
  }

  public reducirStockReservado(): void {
    this.detalle.forEach(item => {
      item.reducirStockReservado()
    })
  }
}