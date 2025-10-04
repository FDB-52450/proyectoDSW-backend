import { ClienteRepository } from "../../src/cliente/cliente-repository.js";
import { Pedido } from "../../src/pedido/pedido-entity.js"
import { PedidoProd } from "../../src/pedidoprod/pedidoprod-entity.js";
import { ProductoRepository } from "../../src/producto/producto-repository.js"

import { MikroORM } from "@mikro-orm/mysql"

function getRandomDateAroundToday(maxDays = 5): Date {
  const now = new Date();
  const offsetDays = Math.floor(Math.random() * (2 * maxDays + 1)) - maxDays;
  const randomDate = new Date(now);
  randomDate.setDate(now.getDate() + offsetDays);

  return randomDate;
}

function getRandomDateInLastMonths(cantMeses: number): Date {
    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - cantMeses)

    const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime())
    return new Date(randomTime)
}


export async function seedPedidos(orm: MikroORM) {
    const pedidoEm = orm.em.fork()
    const prodRepo = new ProductoRepository(pedidoEm.fork())
    const clienteRepo = new ClienteRepository(pedidoEm.fork())

    const [productos, totalItems] = await prodRepo.findAll(1)
    const [clientes, totalClientes] = await clienteRepo.findAll(1)

    const pedidos: Pedido[] = [];

    for (let i = 1; i <= 500; i++) {
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

        pedido.estado = Math.random() < 0.9 ? 'confirmado' : (Math.random() < 0.2 ? 'pendiente' : 'cancelado')
        pedido.fechaPedido = getRandomDateInLastMonths(3)

        cliente.pedidos.add(pedido)

        pedido.estado === 'pendiente' ? pedido.aumentarStockReservado() : ''

        pedidos.push(pedido)
        pedidoEm.persist(pedido)
    }

    await pedidoEm.flush()
}