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
    public id = crypto.randomInt(1000, 10000)
  ) {
    this.precioTotal = this.calcularPrecioTotal()
  }

  public calcularPrecioTotal(): number {
    return this.detalle.reduce((total, item) => total + item.cantidad * item.precioUnidad, 0)
  }

  public checkDetalle(): boolean {
    return this.detalle.every(item => item.checkStock())
  }

  public actualizarEstado(nuevoEstado: string): boolean {
    // A PEDIDO CAN ONLY GO FROM 'pendiente' TO 'confirmado' OR 'cancelado'

    if (this.estado === 'pendiente') {
      if (nuevoEstado === 'confirmado' || nuevoEstado === 'cancelado') {
        this.estado = nuevoEstado
        this.reducirStockReservado()

        if (nuevoEstado === 'confirmado') {
          this.reducirStock()
        }

        return true
      }
    }

    return false
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

  public aumentarStock(): void {
    this.detalle.forEach(item => {
      item.aumentarStock()
    })
  }

  public reducirStock(): void {
    this.detalle.forEach(item => {
      item.reducirStock()
    })
  }
}