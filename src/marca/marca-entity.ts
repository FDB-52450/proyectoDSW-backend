import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core'
import { Imagen } from '../imagen/imagen-entity.js'

@Entity()
export class Marca {
  @PrimaryKey()
  id!: number

  @Property({ unique: true})
  nombre!: string

  @ManyToOne(() => Imagen)
  imagen!: Imagen

  constructor(
    nombre: string,
    imagen: Imagen,
  ) {
    this.nombre = nombre
    this.imagen = imagen
  }
}