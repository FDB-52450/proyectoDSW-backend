import { Categoria } from "../categoria/categoria-entity.js";
import { Marca } from "../marca/marca-entity.js";
import { Producto } from "../producto/producto-entity.js";

import { MikroORM } from "@mikro-orm/mysql";

export async function clearSeeds(orm: MikroORM) {
    const clearingEm = orm.em.fork()

    await clearingEm.nativeDelete(Producto, {})
    await clearingEm.nativeDelete(Marca, {})
    await clearingEm.nativeDelete(Categoria, {})
}