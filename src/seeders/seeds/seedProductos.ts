import { Producto } from "../../producto/producto-entity.js"
import { MarcaRepository } from "../../marca/marca-repository.js"
import { CategoriaRepository } from "../../categoria/categoria-repository.js"

import { MikroORM } from "@mikro-orm/mysql"

export async function seedProductos(orm: MikroORM) {
    const productoEm = orm.em.fork()
    const marcaRepo = new MarcaRepository(productoEm.fork())
    const categoriaRepo = new CategoriaRepository(productoEm.fork())

    const marcas = await marcaRepo.findAll()
    const categorias = await categoriaRepo.findAll()

    const productos: Producto[] = [];

    const nombresBase = [
        'NVIDIA RTX 4060', 'NVIDIA RTX 4070 Ti', 'AMD RX 7800 XT', 'NVIDIA RTX 3080',
        'Intel Core i9-13900K', 'AMD Ryzen 7 7800X3D', 'Intel Core i5-13600KF', 'AMD Ryzen 5 5600',
        'Corsair Vengeance 16GB DDR5', 'G.SKILL Trident Z 32GB DDR4', 'Kingston Fury 8GB DDR4',
        'Samsung 980 PRO 1TB NVMe', 'WD Black SN850X 2TB', 'Crucial MX500 500GB SATA',
        'ASUS ROG Strix B550-F', 'MSI MAG Z790 Tomahawk', 'Gigabyte B760 AORUS Elite',
        'Corsair RM850x', 'EVGA 750 GQ', 'Seasonic Focus GX-650',
        'NZXT H510', 'Lian Li PC-O11 Dynamic', 'Fractal Design Meshify C',
        'Noctua NH-D15', 'Corsair H100i Elite', 'be quiet! Pure Rock 2',
        'LG UltraGear 27GL850', 'ASUS TUF VG27AQ', 'Samsung Odyssey G7'
    ];

    for (let i = 1; i <= nombresBase.length; i++) {
        const nombre = `${nombresBase[i % nombresBase.length]}`
        const desc = `Descripción del producto ${i}`
        const precio = parseFloat((Math.random() * 50000 + 10).toFixed(2))
        const stock = Math.floor(Math.random() * 50) + 1
        const descuento = Math.random() < 0.5 ? Math.floor(Math.random() * 31) : 0
        const destacado = Math.random() < 0.2

        const marca = marcas[Math.floor(Math.random() * marcas.length)];
        const categoria = categorias[Math.floor(Math.random() * categorias.length)];

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