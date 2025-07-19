import crypto from 'node:crypto'
import { Producto } from '../producto/producto-entity.js'

export class PedidoProd {
  constructor(
    public cantidad: number,
    public producto: Producto,
    public precioUnidad = producto.precio,
    public precioTotal = cantidad * precioUnidad,
    public id = crypto.randomInt(1000, 10000)
  ) {}

  public checkStock(): boolean {
    return (0 < this.cantidad && this.cantidad <= this.producto.getStockDisponible())
  }

  public aumentarStockReservado(): void {
    this.producto.aumentarStockReservado(this.cantidad)
  }

  public reducirStockReservado(): void {
    this.producto.reducirStockReservado(this.cantidad)
  }

  public reducirStock(): void {
    this.producto.reducirStock(this.cantidad)
  }

  public aumentarStock(): void {
    this.producto.aumentarStock(this.cantidad)
  }
}