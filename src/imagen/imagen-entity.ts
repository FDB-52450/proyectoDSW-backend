import { Entity, ManyToOne, PrimaryKey, Property, Rel, AfterDelete, BeforeCreate } from '@mikro-orm/core'
import { Producto } from '../producto/producto-entity.js'
import { fileTypeFromBuffer } from 'file-type'

import fs from 'fs'
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

    buffer: Buffer

    constructor(
        buffer: Buffer,
        imagenPrim: boolean = true
    ) {
        this.imagenPrimaria = imagenPrim
        this.buffer = buffer
    }

    async generateUrlName(): Promise<string> {
        const allowedTypes = ['png', 'jpg', 'webp']
        const type = await fileTypeFromBuffer(this.buffer);

        if (!type || !allowedTypes.includes(type.ext)) {
            throw new Error("UNKNOWN FILE")
        } else {
            return Date.now() + "-" + Math.round(Math.random() * 1E9) + "." + type.ext
        }
    }

    @BeforeCreate()
    async saveToDisk() {
        this.url = await this.generateUrlName()
        await fs.promises.writeFile(`images/${this.url}`, this.buffer);
    }

    @AfterDelete()
    async deleteFromDisk() {
        try {
            await fs.promises.unlink("images/" + this.url);
        } catch (err) {
            console.warn('Failed to delete image:', err);
        }
    }
}