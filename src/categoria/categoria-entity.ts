import { Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class Categoria {
  @PrimaryKey()
  id!: number

  @Property({ unique: true})
  nombre!: string

  constructor(
    nombre: string
  ) {
    this.nombre = nombre
  }
}