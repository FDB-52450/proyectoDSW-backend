import { Entity, PrimaryKey, Property } from '@mikro-orm/core'
@Entity()
export class Imagen{
    @PrimaryKey()
    id!: number

    @Property()
    url!: string 

    @Property()
    imagenPrimaria!: boolean

    constructor(
        url: string = 'template.png',
        imagenPrim: boolean = true,
    ) {
        this.url = url
        this.imagenPrimaria = imagenPrim
    }
}