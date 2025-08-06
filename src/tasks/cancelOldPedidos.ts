import cron from 'node-cron';
import { Pedido } from '../pedido/pedido-entity.js';
import { orm } from '../shared/database.js';

import { infoLogger, errorLogger } from '../shared/loggers.js';
export function startPedidosScanTask() {
    cron.schedule('0 0 * * *', async () => {
    infoLogger.info('[TASK] Started scan for overdue pedidos.');

    const pedidosEm = orm.em.fork()
    const maxDate = new Date()
    maxDate.setHours(0, 0, 0, 0)
    maxDate.setDate(maxDate.getDate() - 1)

    const pedidos = await pedidosEm.find(Pedido, {fechaEntrega: { $lt: maxDate}, estado: 'pendiente'}, {populate: ['detalle', 'detalle.producto']})

    if (pedidos.length > 0) {
        infoLogger.info(`[TASK] Found ${pedidos.length} overdue pedidos, started update process.`)

        for (const pedido of pedidos) {
            pedido.estado = 'cancelado'
            pedido.reducirStockReservado()
        }

        try {
            await pedidosEm.flush()
            infoLogger.info('[TASK] Finished update process successfully.');
            infoLogger.info('[TASK] Finished pedidos scan successfully.');
        } catch (err) {
            infoLogger.info('[TASK] An error has occurred, check error.log for more information.')
            errorLogger.error(err)
        }
    } else {
        infoLogger.info('[TASK] No pedidos were found for updating.')
        infoLogger.info('[TASK] Finished pedidos scan successfully.');
    }
    })
}