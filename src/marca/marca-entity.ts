import { Entity, PrimaryKey, Property, OneToOne} from '@mikro-orm/core'
import { Imagen } from '../imagen/imagen-entity.js'

@Entity()
export class Marca {
  @PrimaryKey({type: 'number', autoincrement: true})
  id!: number

  @Property({ unique: true, type: 'string'})
  nombre!: string

  @OneToOne(() => Imagen, {nullable: true, orphanRemoval: true, deleteRule: "cascade"})
  imagen!: Imagen | null

  constructor(
    nombre: string,
    imagen: Imagen | null,
  ) {
    this.nombre = nombre
    this.imagen = imagen
  }
}