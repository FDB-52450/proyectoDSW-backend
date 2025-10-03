import { Marca } from "../../src/marca/marca-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedMarcas(orm: MikroORM) {
    const marcaEm = orm.em.fork()

    const marcas: Marca[] = []

    const nombresBase = [
        "Intel", "AMD", "NVIDIA", "Corsair", "Kingston", 
        "Seagate", "Samsung", "Cooler Master", "Logitech", "Razer", 
        "ASUS", "MSI", "Dell", "HP", "Apple"
    ]

    for (const nombre of nombresBase) {
        const marca = new Marca(nombre, null)

        marcas.push(marca);
        marcaEm.persist(marca);
    }

    await marcaEm.flush();
}