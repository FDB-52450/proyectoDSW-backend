import { Entity, ManyToOne, PrimaryKey, Property, Rel, AfterDelete, BeforeCreate } from '@mikro-orm/core'
import { Producto } from '../producto/producto-entity.js'
import { randomUUID } from 'crypto'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import sharp from 'sharp'
import path from 'path'

import fs from 'fs'
@Entity()
export class Imagen{
    @PrimaryKey()
    id!: number

    @Property() // TODO: Consider deleting this.
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

    // NOTE: Do not change the location of this file.
    // This file uses relative pathing to determine where /images/ is located,
    // so changing the location will change where the files are stored.
    // [If you MUST change it, then adjust the basePath and filePath accordingly]

    @BeforeCreate()
    async saveToDisk() {
        this.url = randomUUID()
        
        const imageSizes = {'small': 100, 'medium': 500, 'large': 1000}
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const basePath = path.join(__dirname, '..', '..', '..', 'images', this.url);

        try {
           await fs.promises.mkdir(basePath, {recursive: true}) 
        } catch (err) {
            throw new Error(`Error when creating image directory: ${err}`)
        }

        for (const [size, width] of Object.entries(imageSizes)) {
            const resizedBuffer = await sharp(this.buffer).trim().resize({height: width, fit: 'inside'}).toFormat('webp').toBuffer()

            try {
                await fs.promises.writeFile(path.join(basePath, `${size}.webp`), resizedBuffer)
            } catch (err) {
                throw new Error(`Error when saving image: ${err}`)
            }
        }
    }

    @AfterDelete()
    async deleteFromDisk() {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const filePath = path.join(__dirname, '..', '..', 'images', this.url);

        try {
            await fs.promises.rm(filePath, {recursive: true, force: true});
        } catch (err) {
            console.warn('Failed to delete images:', err);
        }
    }
}