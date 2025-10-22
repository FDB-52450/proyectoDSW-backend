import { Cliente } from '../cliente/cliente-entity.js'
import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'
import { Entity, PrimaryKey, Property, OneToMany, Collection, ManyToOne, Rel, Cascade } from '@mikro-orm/core'

@Entity()
export class Pedido {
  @PrimaryKey({type: 'number', autoincrement: true})
  id!: number

  @Property({type: 'string'})
  tipoEntrega!: string

  @Property({type: 'string'})
  tipoPago!: string

  @Property({type: 'string'})
  estado: string = 'pendiente'

  @Property({type: 'number'})
  precioTotal: number

  @Property({type: 'date'})
  fechaEntrega!: Date

  @Property({type: 'date'})
  fechaPedido: Date = new Date()

  @OneToMany(() => PedidoProd, pedidoProd => pedidoProd.pedido, {cascade: [Cascade.REMOVE, Cascade.PERSIST]})
  detalle = new Collection<PedidoProd>(this)

  @ManyToOne(() => Cliente)
  cliente!: Rel<Cliente>

  constructor(
    tipoEntrega: string = 'retiro',
    tipoPago: string = 'efectivo',
    detalle: Array<PedidoProd>,
    cliente: Rel<Cliente>,
    fechaEntrega?: Date,
  ) {
    this.tipoEntrega = tipoEntrega
    this.tipoPago = tipoPago
    this.detalle = new Collection<PedidoProd>(this)
    this.cliente = cliente
    this.detalle.add(detalle)
    this.precioTotal = this.calcularPrecioTotal()

    if (fechaEntrega) {
      this.fechaEntrega = fechaEntrega
    } else {
      this.fechaEntrega = this.calcularFechaEntrega()
    }
  }

  public calcularPrecioTotal(): number {
    return this.detalle.reduce((total, item) => total + item.cantidad * item.precioUnidad, 0)
  }

  public checkDetalle(): boolean {
    return this.detalle.getItems().every(item => item.checkStock())
  }

  public calcularFechaEntrega(): Date {
    // DOCS: Sets default date at 7 days later.

    let fechaEntrega = new Date(this.fechaPedido.getTime())
    fechaEntrega.setDate(fechaEntrega.getDate() + 7)

    if (fechaEntrega.getDay() === 0) {
      fechaEntrega.setDate(fechaEntrega.getDate() + 1)
    }

    return fechaEntrega
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