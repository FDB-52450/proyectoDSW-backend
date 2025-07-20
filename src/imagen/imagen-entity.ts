import { Entity, ManyToOne, PrimaryKey, Property, Rel } from '@mikro-orm/core'
import { Producto } from '../producto/producto-entity.js'
@Entity()
export class Imagen{
    @PrimaryKey()
    id!: number

    @Property()
    url!: string 

    @Property()
    imagenPrimaria!: boolean

    @ManyToOne(() => Producto, {nullable: true, hidden: true})
    producto!: Rel<Producto> // ONLY ADDED BECAUSE MIKROORM FORCES ONE TO MANY RELATIONS TO HAVE A MANY TO ONE ON THE OTHER SIDE

    constructor(
        url: string = 'template.png',
        imagenPrim: boolean = true,
    ) {
        this.url = url
        this.imagenPrimaria = imagenPrim
    }
}