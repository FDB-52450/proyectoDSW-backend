import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { MikroORM } from "@mikro-orm/mysql"

import { Producto } from "../../producto/producto-entity.js"
import { Imagen } from '../../imagen/imagen-entity.js';
import { MarcaRepository } from "../../marca/marca-repository.js"
import { CategoriaRepository } from "../../categoria/categoria-repository.js"

import { products } from "../productsData/products.js"

function getFileBufferIfExists(productName: string): Buffer | null {
    const productFilename = productName.toLowerCase().replace(/\s+/g, '-') + '.webp'
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const imagePath = path.join(__dirname, '..', '..', '..', 'tests', 'testImages', 'productImages', productFilename);

    try {
        if (fs.existsSync(imagePath)) {
            return fs.readFileSync(imagePath);
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
}

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
        const destacado = Math.random() < 0.05

        const marca = marcas[product.brandId - 1]
        const categoria = categorias[product.categoryId - 1]

        const imagen = getFileBufferIfExists(product.name)
        const imagenes = imagen ? [new Imagen(imagen, true)] : []

        const producto = new Producto(
            nombre,
            desc,
            precio,
            stock,
            descuento,
            destacado,
            imagenes,
            marca,
            categoria
        )

        productos.push(producto);
        productoEm.persist(producto);
    }

    await productoEm.flush();
}