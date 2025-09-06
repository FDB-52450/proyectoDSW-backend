import { Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class Categoria {
  @PrimaryKey()
  id!: number

  @Property({ unique: true})
  nombre!: string

  @Property()
  duracionGarantia!: number

  @Property()
  stockLimit!: number

  constructor(
    nombre: string,
    duracionGar: number,
    stockLim: number
  ) {
    this.nombre = nombre
    this.duracionGarantia = duracionGar
    this.stockLimit = stockLim
  }
}