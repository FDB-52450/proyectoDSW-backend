import { Categoria } from "../../categoria/categoria-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedCategorias(orm: MikroORM) {
    const categoriaEm = orm.em.fork()

    const categorias: Categoria[] = []

    const nombresBase = [
        'Procesadores', 'Tarjetas gráficas', 'Placas madre', 'Memorias RAM', 'Almacenamiento',
        'Fuentes de poder', 'Gabinetes', 'Refrigeración', 'Monitores', 'Periféricos',
    ];

    for (let i = 1; i <= nombresBase.length; i++) {
        const nombre = `${nombresBase[i % nombresBase.length]}`
        const categoria = new Categoria(nombre)

        categorias.push(categoria);
        categoriaEm.persist(categoria);
    }

    await categoriaEm.flush();
}