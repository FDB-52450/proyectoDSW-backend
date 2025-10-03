import { Entity, PrimaryKey, Property, ManyToOne, OneToMany, Collection, BeforeCreate, BeforeUpdate} from '@mikro-orm/core'
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
  descuento: number

  @Property()
  precioFinal!: number

  @Property()
  stock!: number

  @Property({ hidden: true })
  stockReservado: number = 0

  @Property({ default: false})
  destacado!: boolean
  
  @Property({ default: false})
  ocultado!: boolean

  @Property({ onCreate: () => new Date()})
  fechaIngreso!: Date

  @OneToMany(() => Imagen, img => img.producto, {nullable: true, orphanRemoval: true})
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
    descuento: number = 0,
    destacado: boolean = false,
    ocultado: boolean = false,
    imagenes: Imagen[],
    marca: Marca,
    categoria: Categoria,
  ) {
    this.nombre = nombre
    this.desc = desc
    this.precio = precio
    this.stock = stock
    this.descuento = descuento
    this.destacado = destacado
    this.ocultado = ocultado
    this.imagenes = new Collection<Imagen>(this)
    this.imagenes.add(imagenes)
    this.marca = marca
    this.categoria = categoria
    this.fechaIngreso = new Date()
    this.stockReservado = 0
  }

  @BeforeCreate()
  @BeforeUpdate()
  setFinalPrice() {
    this.precioFinal = Math.round(this.precio - (this.precio * this.descuento / 100));
  }

  public handleImagenes(imagenesNuevas: Array<Imagen>): void {
    const maxLength = Math.max(imagenesNuevas.length, this.imagenes.length)
    for (let x = 0; x < maxLength; x++) {
      const nuevaImagen = imagenesNuevas[x]
      const viejaImagen = this.imagenes.getItems()[x]

      if (viejaImagen && nuevaImagen) {
        if (nuevaImagen.id) {
          if (!(nuevaImagen.id === viejaImagen.id)) {
            this.imagenes.remove(viejaImagen)
            this.imagenes.add(nuevaImagen)
          }
        } else {
          this.imagenes.remove(viejaImagen)
          this.imagenes.add(nuevaImagen)
        }
      } else if (nuevaImagen) {
        this.imagenes.add(nuevaImagen)
      } else if (viejaImagen) {
        this.imagenes.remove(viejaImagen)
      }
    }

    for (let x = 0; x < this.imagenes.length; x++) {
      if (x === 0) {
        this.imagenes[x].imagenPrimaria = true
      } else {
        this.imagenes[x].imagenPrimaria = false
      }
    }
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