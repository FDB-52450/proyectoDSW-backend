import path from "path"
import fs from 'fs'

import { MikroORM } from "@mikro-orm/mysql"
import { fileURLToPath } from "url"

import { Marca } from "../../src/marca/marca-entity.js"
import { Imagen } from "../../src/imagen/imagen-entity.js"

function getFileBufferIfExists(productName: string): Buffer | null {
    const productFilename = productName.toLowerCase().replace(' ', '') + 'Logo.webp'
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const imagePath = path.join(__dirname, '..', '..', '..', 'tests', 'testImages', 'brandImages', productFilename)

    try {
        if (fs.existsSync(imagePath)) {
            return fs.readFileSync(imagePath)
        } else {
            return null
        }
    } catch (err) {
        return null
    }
}

export async function seedMarcas(orm: MikroORM) {
    const marcaEm = orm.em.fork()

    const marcas: Marca[] = []

    const nombresBase = [
        "Intel", "AMD", "NVIDIA", "Corsair", "Kingston", 
        "Seagate", "Samsung", "Cooler Master", "Logitech", "Razer", 
        "ASUS", "MSI", "Dell", "HP", "Apple"
    ]

    for (const nombre of nombresBase) {
        const imgBuffer = getFileBufferIfExists(nombre)
        const imagen = imgBuffer ? new Imagen(imgBuffer, true) : null

        const marca = new Marca(nombre, imagen)

        marcas.push(marca);
        marcaEm.persist(marca);
    }

    await marcaEm.flush();
}