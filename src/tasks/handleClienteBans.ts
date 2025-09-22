import cron from 'node-cron'

import { errorLogger, infoLogger } from '../shared/loggers.js'
import { orm } from '../shared/database.js'
import { Cliente } from '../cliente/cliente-entity.js'

export function startClientesScanTask() {   
    cron.schedule('5 0 * * * ', async () => {
        infoLogger.info('[TASK-CLI-BAN] Started scan for banned clientes.')

        const clientesEm = orm.em.fork()
        const today = new Date()
        const clientesBanned = await clientesEm.find(Cliente, { banEnd: { $lte: today }})

        for (const cliente of clientesBanned) {
            cliente.banStart = null
            cliente.banEnd = null
            cliente.banRazon = null
        }

        try {
            await clientesEm.flush()
            infoLogger.info('[TASK-CLI-UNBAN] Finished scan for banned clientes.')
        } catch (err) {
            infoLogger.info('[TASK-CLI-UNBAN] An error has occurred, check error.log for more information.')
            errorLogger.error(err)
        }
    })
}