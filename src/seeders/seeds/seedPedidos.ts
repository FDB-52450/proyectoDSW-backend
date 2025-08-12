import { ClienteRepository } from "../../cliente/cliente-repository.js";
import { Pedido } from "../../pedido/pedido-entity.js"
import { PedidoProd } from "../../pedidoprod/pedidoprod-entity.js";
import { ProductoRepository } from "../../producto/producto-repository.js"

import { MikroORM } from "@mikro-orm/mysql"

function getRandomDateAroundToday(maxDays = 5): Date {
  const now = new Date();
  const offsetDays = Math.floor(Math.random() * (2 * maxDays + 1)) - maxDays;
  const randomDate = new Date(now);
  randomDate.setDate(now.getDate() + offsetDays);

  return randomDate;
}

export async function seedPedidos(orm: MikroORM) {
    const pedidoEm = orm.em.fork()
    const prodRepo = new ProductoRepository(pedidoEm.fork())
    const clienteRepo = new ClienteRepository(pedidoEm.fork())

    const [productos, totalItems] = await prodRepo.findAll(1)
    const clientes = await clienteRepo.findAll()

    const pedidos: Pedido[] = [];

    for (let i = 1; i <= 20; i++) {
        const tipoEntrega = Math.random() < 0.8 ? 'retiro' : 'envio'
        const tipoPago = Math.random() < 0.6 ? 'efectivo' : 'credito'
        const fechaEntrega = Math.random() < 0.8 ? getRandomDateAroundToday() : undefined
        const cliente = clientes[Math.floor(Math.random() * clientes.length)]

        const length = Math.floor(Math.random() * 2) + 1
        const detalle = Array.from({ length }, () => {return new PedidoProd(
            Math.floor(Math.random() * 5) + 1,
            productos[Math.floor(Math.random() * productos.length)]
        )});

        const pedido = new Pedido(
            tipoEntrega,
            tipoPago,
            detalle,
            cliente,
            fechaEntrega
        )

        cliente.pedidos.add(pedido)

        pedido.aumentarStockReservado()
        pedidos.push(pedido)
        pedidoEm.persist(pedido)
    }

    await pedidoEm.flush()
}