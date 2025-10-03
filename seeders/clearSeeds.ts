import { Administrador } from "../src/administrador/administrador-entity.js";
import { Categoria } from "../src/categoria/categoria-entity.js";
import { Cliente } from "../src/cliente/cliente-entity.js";
import { Marca } from "../src/marca/marca-entity.js";
import { Pedido } from "../src/pedido/pedido-entity.js";
import { PedidoProd } from "../src/pedidoprod/pedidoprod-entity.js";
import { Producto } from "../src/producto/producto-entity.js";

import { MikroORM } from "@mikro-orm/mysql";

export async function clearSeeds(orm: MikroORM) {
    const clearingEm = orm.em.fork()
    const tables = ['categoria', 'marca', 'pedido', 'pedido_prod', 'producto', 'administrador', 'cliente']

    await clearingEm.nativeDelete(PedidoProd, {})
    await clearingEm.nativeDelete(Pedido, {})
    await clearingEm.nativeDelete(Cliente, {})
    await clearingEm.nativeDelete(Producto, {})
    await clearingEm.nativeDelete(Marca, {})
    await clearingEm.nativeDelete(Categoria, {})
    await clearingEm.nativeDelete(Administrador, {})

    for (const tableName of tables) {
        await clearingEm.getConnection().execute(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
    }
}