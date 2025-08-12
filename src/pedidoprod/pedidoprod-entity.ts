import { Entity, PrimaryKey, Property, OneToOne, ManyToOne, Rel } from '@mikro-orm/core'
import { Producto } from '../producto/producto-entity.js'
import { Pedido } from '../pedido/pedido-entity.js'

@Entity()
export class PedidoProd {
  @PrimaryKey()
  id!: number

  @Property()
  cantidad!: number

  @ManyToOne(() => Producto)
  producto!: Producto

  @Property()
  precioUnidad!: number

  @Property()
  precioTotal!: number

  @ManyToOne(() => Pedido, {hidden: true})
  pedido!: Rel<Pedido>

  constructor(
    cantidad: number,
    producto: Producto,
  ) {
    this.cantidad = cantidad
    this.producto = producto
    this.precioUnidad = this.producto.precioFinal
    this.precioTotal = this.precioUnidad * this.cantidad
  }

  public checkStock(): boolean {
    return (this.cantidad <= this.producto.getStockDisponible())
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