import { Marca } from "../../marca/marca-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedMarcas(orm: MikroORM) {
    const marcaEm = orm.em.fork()

    const marcas: Marca[] = []

    const nombresBase = [
        'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'EVGA',
        'Intel', 'AMD', 'Kingston', 'Samsung', 'Cooler Master',
        'NZXT', 'Seagate', 'Western Digital', 'Thermaltake', 'Zotac'
    ];

    for (let i = 1; i <= nombresBase.length; i++) {
        const nombre = `${nombresBase[i % nombresBase.length]}`
        const marca = new Marca(nombre, null)

        marcas.push(marca);
        marcaEm.persist(marca);
    }

    await marcaEm.flush();
}