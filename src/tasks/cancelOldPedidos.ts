import cron from 'node-cron'
import { Pedido } from '../pedido/pedido-entity.js'
import { orm } from '../shared/database.js'

import { infoLogger, errorLogger } from '../shared/loggers.js'
import { PedidoRepository } from '../pedido/pedido-repository.js'
import { Cliente } from '../cliente/cliente-entity.js'

const thresholds = [
    { maxPedidos: 3, maxTotal: 100000, banDuration: 3 },
    { maxPedidos: 5, maxTotal: 500000, banDuration: 7 },
    { maxPedidos: 10, maxTotal: 1000000, banDuration: 30 },
    { maxPedidos: 15, maxTotal: 5000000, banDuration: Infinity}
]

function calculateBanDuration(numPedidos: number, total: number): number {
    for (const threshold of thresholds) {
        if (numPedidos <= threshold.maxPedidos || total <= threshold.maxTotal) {
            return threshold.banDuration
        }
    }
    return 0
}

export function startPedidosScanTask() {
    cron.schedule('0 0 * * *', async () => {
        infoLogger.info('[TASK-PED] Started scan for overdue pedidos.')

        const pedidosEm = orm.em.fork()
        const maxDate = new Date()
        const pedRepo = new PedidoRepository(orm.em.fork())

        maxDate.setHours(0, 0, 0, 0)
        maxDate.setDate(maxDate.getDate() - 1)

        const pedidos = await pedidosEm.find(Pedido, {fechaEntrega: { $lt: maxDate}, estado: 'pendiente'}, {populate: ['detalle', 'detalle.producto']})

        if (pedidos.length > 0) {
            infoLogger.info(`[TASK-PED-UPD] Found ${pedidos.length} overdue pedidos, started update process.`)

            for (const pedido of pedidos) {
                pedido.estado = 'cancelado'
                pedido.reducirStockReservado()
            }

            try {
                await pedidosEm.flush()
                infoLogger.info('[TASK-PED-UPD] Finished update process successfully.')
            } catch (err) {
                infoLogger.info('[TASK-PED-UPD] An error has occurred, check error.log for more information.')
                errorLogger.error(err)
            }

            infoLogger.info('[TASK-CLI-BAN] Started scan for bannable clients.')
  
            const pedidosData = await pedRepo.findPedidosDataByCliente(undefined, 'cancelado')

            for (const pedData of pedidosData) {
                const cantPedidos = pedData.cantPedidos
                const totalPedidos = pedData.totalPedidos
                const banDuration = calculateBanDuration(cantPedidos, totalPedidos)

                if (banDuration > 0) {
                    const cliente = await pedidosEm.findOneOrFail(Cliente, {id: pedData.clienteId})

                    cliente.banStart = new Date()

                    if (banDuration === Infinity) {
                        infoLogger.info(`[TASK-CLI-BAN] Cliente ${cliente.id} banned forever [${cantPedidos} pedidos cancelados - $${totalPedidos.toLocaleString('es-AR')}]`)
                    } else {
                        cliente.banEnd = new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000)
                        infoLogger.info(`[TASK-CLI-BAN] Cliente ${cliente.id} banned for ${banDuration} days [${cantPedidos} pedidos cancelados - $${totalPedidos.toLocaleString('es-AR')}]`)
                    }
                }
            }

            try {
                await pedidosEm.flush()
                infoLogger.info('[TASK-CLI-BAN] Finished banning process successfully.')
                infoLogger.info('[TASK-PED] Finished pedidos scan successfully.')
            } catch (err) {
                infoLogger.info('[TASK-CLI-BAN] An error has occurred, check error.log for more information.')
                errorLogger.error(err)
            }
        } else {
            infoLogger.info('[TASK-PED] No pedidos were found for updating.')
            infoLogger.info('[TASK-PED] Finished pedidos scan successfully.')
        }
    })
}