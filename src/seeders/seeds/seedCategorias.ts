import { Categoria } from "../../categoria/categoria-entity.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedCategorias(orm: MikroORM) {
    const categoriaEm = orm.em.fork()

    const categorias: Categoria[] = []

    const infoBase = [
        {nombre: 'Placas madre', duracionGar: 12, stockLim: 3},
        {nombre: 'Procesadores', duracionGar: 24, stockLim: 2},
        {nombre: 'Tarjetas gráficas', duracionGar: 24, stockLim: 2},
        {nombre: 'Memorias RAM', duracionGar: 12, stockLim: 4},
        {nombre: 'Almacenamiento', duracionGar: 12, stockLim: 6},
        {nombre: 'Fuentes de poder', duracionGar: 36, stockLim: 2},
        {nombre: 'Gabinetes', duracionGar: 12, stockLim: 3},
        {nombre: 'Refrigeración', duracionGar: 12, stockLim: 10},
        {nombre: 'Mouses', duracionGar: 12, stockLim: 5},
        {nombre: 'Teclados', duracionGar: 12, stockLim: 5},
        {nombre: 'Auriculares', duracionGar: 12, stockLim: 5},
        {nombre: 'Microfonos', duracionGar: 12, stockLim: 5},
        {nombre: 'Monitores', duracionGar: 24, stockLim: 3},
        {nombre: 'Notebooks', duracionGar: 24, stockLim: 2},
        {nombre: 'Computadoras', duracionGar: 24, stockLim: 2},
    ]

    for (const info of infoBase) {
        const categoria = new Categoria(info.nombre, info.duracionGar, info.stockLim)

        categorias.push(categoria);
        categoriaEm.persist(categoria);
    }

    await categoriaEm.flush();
}