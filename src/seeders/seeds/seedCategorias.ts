import { Categoria } from "../../categoria/categoria-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedCategorias(orm: MikroORM) {
    const categoriaEm = orm.em.fork()

    const categorias: Categoria[] = []

    const nombresBase = [
        'Placas Madre', 'Procesadores', 'Tarjetas Gráficas', 'Memorias RAM', 'Almacenamiento',
        'Fuentes de Poder', 'Gabinetes', 'Refrigeración', 'Mouses', 'Teclados', 'Auriculares',
        'Microfonos', 'Monitores', 'Notebooks', 'Computadoras'
    ];

    for (const nombre of nombresBase) {
        const categoria = new Categoria(nombre)

        categorias.push(categoria);
        categoriaEm.persist(categoria);
    }

    await categoriaEm.flush();
}