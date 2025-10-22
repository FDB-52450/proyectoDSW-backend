import { Entity, PrimaryKey, Property} from '@mikro-orm/core'

@Entity()
export class Categoria {
  @PrimaryKey({type: 'number', autoincrement: true})
  id!: number

  @Property({ unique: true, type: 'string'})
  nombre!: string

  @Property({type: 'number'})
  duracionGarantia!: number

  @Property({type: 'number'})
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