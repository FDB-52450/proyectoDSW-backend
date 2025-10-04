import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { StatsRepository } from './stats-repository.js'

function getRepo() {
    const em = RequestContext.getEntityManager()

    return new StatsRepository(em as SqlEntityManager)
}

async function statsGetPedidoStats() {
    const repository = getRepo()
    const [cantVentasRaw, montoVentasConfRaw, montoVentasCancRaw, provRaw, ciudadRaw, pagosRaw, entregasRaw, maxDiaRaw, minDiaRaw] = await repository.getPedidoStats()

    return {
        cantVentas: cantVentasRaw[0],
        montoVentas: {
            ventasConfirmadas: montoVentasConfRaw.map((row: any) => ({
                ...row,
                montoTotal: Number(row.montoTotal),
                montoAvg: Number(row.montoAvg),
            })),
            ventasCanceladas: montoVentasCancRaw.map((row: any) => ({
                ...row,
                montoTotal: Number(row.montoTotal),
                montoAvg: Number(row.montoAvg),
            }))
        },
        distDatos: {
            distPagos: pagosRaw,
            distEntregas: entregasRaw,
        },
        geoDistDatos: {
            provincias: provRaw.map((row: any) => ({
                ...row,
                montoTotal: Number(row.montoTotal),
            })),
            ciudades: ciudadRaw.map((row: any) => ({
                ...row,
                montoTotal: Number(row.montoTotal),
            }))
        },
        maxDia: {
            dia: maxDiaRaw[0] ? maxDiaRaw[0].dia : 0,
            monto: maxDiaRaw[0] ? Number(maxDiaRaw[0].monto) : 0,
        },
        minDia: {
            dia: minDiaRaw[0] ? minDiaRaw[0].dia : 0,
            monto: minDiaRaw[0] ? Number(minDiaRaw[0].monto) : 0,
        }
    }
}

async function statsGetProductoStats() {
    const repository = getRepo()
    const [cantVendidaRaw, cantNoVendidaRaw, montoVentasRaw] = await repository.getProductoStats()

    return {
        cantVendida: cantVendidaRaw.map((row: any) => ({
            ...row,
            cantVendida: Number(row.cantVendida)
        })),
        ventas: montoVentasRaw.map((row: any) => ({
            ...row,
            montoTotal: Number(row.montoTotal),
        })),
        cantNoVendida: {
            cantNoVendida: Number(cantNoVendidaRaw[0].cantNoVendida),
            cantTotal: Number(cantNoVendidaRaw[0].cantTotal)
        }
    }
}

async function statsGetMarcaStats() {
    const repository = getRepo()
    const montoVentasRaw = await repository.getGeneralStats('marca')

    return {
        ventas: montoVentasRaw.map((row: any) => ({
            ...row,
            montoTotal: Number(row.montoTotal),
        })),
    }
}

async function statsGetCategoriaStats() {
    const repository = getRepo()
    const montoVentasRaw = await repository.getGeneralStats('categoria')

    return {
        ventas: montoVentasRaw.map((row: any) => ({
            ...row,
            montoTotal: Number(row.montoTotal),
        })),
    }
}

async function statsGetClienteStats() {
    const repository = getRepo()
    const [cantTotalRaw, highestClientesRaw, cantTotalReiteranteRaw, distCantProvRaw, distCantCiudadRaw, 
    maxDiaRaw, minDiaRaw, averageAgeRaw] = await repository.getClienteStats()

    return {
        cantClientes: cantTotalRaw.map((row: any) => ({...row, cantAcumulada: Number(row.cantAcumulada)})),
        mejoresClientes: highestClientesRaw.map((row: any) => ({...row,montoTotal: Number(row.montoTotal)})),
        clientesReiterantes: Number(cantTotalReiteranteRaw[0].cantTotal),
        geoDistDatos: {
            provincias: distCantProvRaw.map((row: any) => ({...row, cantTotal: Number(row.cantTotal)})),
            ciudades: distCantCiudadRaw.map((row: any) => ({...row,cantTotal: Number(row.cantTotal)}))
        },
        maxDia: {
            dia: maxDiaRaw[0] ? maxDiaRaw[0].dia : 0,
            cant: maxDiaRaw[0] ? Number(maxDiaRaw[0].cant) : 0,
        },
        minDia: {
            dia: minDiaRaw[0] ? minDiaRaw[0].dia : 0,
            cant: minDiaRaw[0] ? Number(minDiaRaw[0].cant) : 0,
        },
        averageAge: Number(averageAgeRaw[0].avgDias)
    }
}


export { statsGetPedidoStats, statsGetCategoriaStats, statsGetMarcaStats, statsGetClienteStats, statsGetProductoStats }