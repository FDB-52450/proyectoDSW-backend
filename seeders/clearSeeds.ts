import path from "path"
import fs from 'fs'

import { Administrador } from "../src/administrador/administrador-entity.js";
import { Categoria } from "../src/categoria/categoria-entity.js";
import { Cliente } from "../src/cliente/cliente-entity.js";
import { Marca } from "../src/marca/marca-entity.js";
import { Pedido } from "../src/pedido/pedido-entity.js";
import { PedidoProd } from "../src/pedidoprod/pedidoprod-entity.js";
import { Producto } from "../src/producto/producto-entity.js";

import { MikroORM } from "@mikro-orm/mysql"

function clearImages() {
    const folderPath = path.resolve('images')
    const normalizedPath = path.normalize(folderPath)
    const lastPart = path.basename(normalizedPath)

    // Check to prevent wrong folder from being deleted.
    if (lastPart !== 'images') {
        return
    }

    try {
        fs.rmSync(folderPath, {recursive: true, force: true})
        fs.mkdirSync(folderPath, {recursive: true})
    } catch (err) {
        console.error('Error borrando imagenes', err)
    }
}

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

    clearImages()

    for (const tableName of tables) {
        await clearingEm.getConnection().execute(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
    }
}