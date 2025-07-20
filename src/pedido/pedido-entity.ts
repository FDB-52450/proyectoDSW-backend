import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'
import { Entity, PrimaryKey, Property, OneToMany, Collection } from '@mikro-orm/core'

@Entity()
export class Pedido {
  @PrimaryKey()
  id!: number

  @Property()
  tipoEntrega!: string

  @Property()
  tipoPago!: string

  @Property()
  estado: string = 'pendiente'

  @Property()
  precioTotal: number

  @Property()
  fechaEntrega!: Date

  @Property()
  fechaPedido: Date = new Date()

  @OneToMany(() => PedidoProd, pedidoProd => pedidoProd.pedido)
  detalle = new Collection<PedidoProd>(this)

  constructor(
    tipoEntrega: string = 'retiro',
    tipoPago: string = 'efectivo',
    fechaEntrega: Date,
    detalle: Array<PedidoProd>,
  ) {
    this.tipoEntrega = tipoEntrega
    this.tipoPago = tipoPago
    this.fechaEntrega = fechaEntrega
    this.detalle = new Collection<PedidoProd>(this)
    this.detalle.add(detalle)
    this.precioTotal = this.calcularPrecioTotal()
  }

  public calcularPrecioTotal(): number {
    return this.detalle.reduce((total, item) => total + item.cantidad * item.precioUnidad, 0)
  }

  public checkDetalle(): boolean {
    return this.detalle.getItems().every(item => item.checkStock())
  }

  // TODO: Determine if this string of methods from pedido to product is even necessary.

  public aumentarStockReservado(): void {
    this.detalle.getItems().forEach(item => {
      item.aumentarStockReservado()
    })
  }

  public reducirStockReservado(): void {
    this.detalle.getItems().forEach(item => {
      item.reducirStockReservado()
    })
  }

  public aumentarStock(): void {
    this.detalle.getItems().forEach(item => {
      item.aumentarStock()
    })
  }

  public reducirStock(): void {
    this.detalle.getItems().forEach(item => {
      item.reducirStock()
    })
  }
}