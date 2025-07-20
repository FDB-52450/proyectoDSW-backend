import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection} from '@mikro-orm/core'
import { Marca } from '../marca/marca-entity.js'
import { Categoria } from '../categoria/categoria-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

@Entity()
export class Producto {
  @PrimaryKey()
  id!: number

  @Property({ unique: true })
  nombre!: string

  @Property({ default: 'Sin descripcion.'})
  desc!: string

  @Property()
  precio!: number

  @Property()
  descuento = 0

  @Property()
  stock!: number

  @Property({ hidden: true })
  stockReservado = 0

  @Property({ default: false})
  destacado!: boolean

  @Property({ onCreate: () => new Date()})
  fechaIngreso!: Date

  @OneToMany(() => Imagen, img => img.producto)
  imagenes = new Collection<Imagen>(this)

  @ManyToOne(() => Marca)
  marca!: Marca

  @ManyToOne(() => Categoria)
  categoria!: Categoria
  
  // TODO: Revise if the assignment of properties in the constructor is necessary
  // and if it can be simplified or optimized.

  constructor(
    nombre: string,
    desc: string = 'Sin descripcion.',
    precio: number,
    stock: number,
    imagenes: Imagen[],
    marca: Marca,
    categoria: Categoria,
  ) {
    this.nombre = nombre
    this.desc = desc
    this.precio = precio
    this.stock = stock
    this.imagenes = new Collection<Imagen>(this)
    this.imagenes.add(imagenes)
    this.marca = marca
    this.categoria = categoria
    this.descuento = 0
    this.fechaIngreso = new Date()
    this.stockReservado = 0
    this.destacado = false
  }

  public getStockDisponible(): number {
    return this.stock - this.stockReservado
  }

  public aumentarStockReservado(cantidad: number): void {
    this.stockReservado += cantidad
  }

  public reducirStockReservado(cantidad: number): void {
    this.stockReservado -= cantidad
  }

  public aumentarStock(cantidad: number): void {
    this.stock += cantidad
  }

  public reducirStock(cantidad: number): void {
    this.stock -= cantidad
  }

  // Method to be used at some point in the future

  public getPrecioConDescuento(): number {
    return this.precio - (this.precio * this.descuento / 100)
  }
}