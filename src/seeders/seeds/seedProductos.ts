import { Producto } from "../../producto/producto-entity.js"
import { MarcaRepository } from "../../marca/marca-repository.js"
import { CategoriaRepository } from "../../categoria/categoria-repository.js"

import { MikroORM } from "@mikro-orm/mysql"

import { products } from "../productsData/products.js"

export async function seedProductos(orm: MikroORM) {
    const productoEm = orm.em.fork()
    const marcaRepo = new MarcaRepository(productoEm.fork())
    const categoriaRepo = new CategoriaRepository(productoEm.fork())

    const marcas = await marcaRepo.findAll()
    const categorias = await categoriaRepo.findAll()
    const productos: Producto[] = [];

    for (const product of products) {
        const nombre = product.name
        const desc = product.desc
        const precio = parseFloat((Math.random() * 500000 + 1000).toFixed(2))
        const stock = Math.floor(Math.random() * 50) + 10
        const descuento = Math.random() < 0.5 ? Math.floor(Math.random() * 31) : 0
        const destacado = Math.random() < 0.5 ? true : false

        const marca = marcas[product.brandId - 1]
        const categoria = categorias[product.categoryId - 1]

        const producto = new Producto(
            nombre,
            desc,
            precio,
            stock,
            descuento,
            destacado,
            [],
            marca,
            categoria
        );

        productos.push(producto);
        productoEm.persist(producto);
    }

    await productoEm.flush();
}