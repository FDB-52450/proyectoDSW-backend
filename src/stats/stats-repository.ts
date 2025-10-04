import { EntityManager } from '@mikro-orm/mysql'

export class StatsRepository {
    constructor(
        private statsEm: EntityManager
    ) {}

    public async getPedidoStats(): Promise<any[]> {
        function buildDistQuery(field: string, alias: string) {
            return `
                SELECT ${field} AS tipo, COUNT(*) AS cant
                FROM pedido ped
                WHERE ped.estado = 'confirmado'
                AND MONTH(ped.fecha_pedido) = MONTH(NOW())
                AND YEAR(ped.fecha_pedido) = YEAR(NOW())
                GROUP BY ${field}
            `
        }

        function buildDiaQuery(order: 'ASC' | 'DESC') {
            return `
                SELECT 
                    DAY(ped.fecha_pedido) AS dia,
                    SUM(ped.precio_total) AS monto 
                FROM pedido ped
                WHERE ped.estado = 'confirmado'
                    AND MONTH(ped.fecha_pedido) = MONTH(NOW())
                    AND YEAR(ped.fecha_pedido) = YEAR(NOW())
                GROUP BY DAY(ped.fecha_pedido)
                ORDER BY monto ${order}
                LIMIT 1
            `
        }

        function buildGeoDistQuery(tipo: 'provincia' | 'ciudad') {
            const isCiudad = tipo === 'ciudad'

            return `
                WITH ${tipo}_totals AS (
                    SELECT 
                        cli.provincia as provincia,
                        ${isCiudad ? 'cli.ciudad as ciudad,' : ''}
                        SUM(ped.precio_total) AS montoTotal
                    FROM pedido ped
                    INNER JOIN cliente cli ON cli.id = ped.cliente_id
                    WHERE 
                        MONTH(ped.fecha_pedido) = MONTH(NOW()) AND 
                        YEAR(ped.fecha_pedido) = YEAR(NOW())
                    GROUP BY cli.provincia ${isCiudad ? ', cli.ciudad' : ''}
                ),
                top_5 AS (
                    SELECT * 
                    FROM ${tipo}_totals 
                    ORDER BY montoTotal DESC 
                    LIMIT 5
                ),
                others AS (
                    SELECT 
                        ${isCiudad ? '"-" as provincia,' : ''}
                        'Otras' AS ${tipo}, 
                        COALESCE(SUM(montoTotal), 0) AS montoTotal
                    FROM ${tipo}_totals
                    WHERE ${isCiudad ? '(provincia, ciudad)' : 'provincia'} NOT IN (SELECT ${isCiudad ? 'provincia, ciudad' : 'provincia'} FROM top_5)
                )
                SELECT * FROM top_5
                UNION ALL
                SELECT * FROM others
                ORDER BY montoTotal DESC
            `
        }

        const cantVentas = await this.statsEm
            .getConnection()
            .execute(`
                select
                    count(*) as cantTotal,
                    count(case when ped.estado = 'confirmado' then 1 end) as cantConfirmado,
                    count(case when ped.estado = 'cancelado' then 1 end) as cantCancelado
                from pedido ped
                where month(ped.fecha_pedido) = month(now())
                    and year(ped.fecha_pedido) = year(now())`
        )

        const montoVentasQuery = 
        `
        SELECT
            DATE_FORMAT(ped.fecha_pedido, '%Y-%m') AS yearMes,
            SUM(ped.precio_total) AS montoTotal,
            ROUND(AVG(ped.precio_total)) as montoAvg
        FROM pedido ped
        WHERE ped.estado = ?
            AND DAY(ped.fecha_pedido) BETWEEN 1 AND DAY(NOW())
            AND ped.fecha_pedido >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
        GROUP BY yearMes
        ORDER BY yearMes ASC;
        `

        const montoVentasConfirmadas = await this.statsEm.getConnection().execute(montoVentasQuery, ['confirmado'])
        const montoVentasCanceladas = await this.statsEm.getConnection().execute(montoVentasQuery, ['cancelado'])
        const distMontoProv = await this.statsEm.getConnection().execute(buildGeoDistQuery('provincia'))
        const distMontoCiudad = await this.statsEm.getConnection().execute(buildGeoDistQuery('ciudad'))

        const distPagos = await this.statsEm.getConnection().execute(buildDistQuery('ped.tipo_pago', 'tipoPago'))
        const distEntregas = await this.statsEm.getConnection().execute(buildDistQuery('ped.tipo_entrega', 'tipoEntrega'))
        const maxDia = await this.statsEm.getConnection().execute(buildDiaQuery('DESC'))
        const minDia = await this.statsEm.getConnection().execute(buildDiaQuery('ASC'))

        return [cantVentas, montoVentasConfirmadas, montoVentasCanceladas, distMontoProv, distMontoCiudad, distPagos, distEntregas, maxDia, minDia]
    }

    public async getProductoStats() {
        function buildHighestSoldQuery() {
            return `
                select prod.id, prod.nombre, sum(ped.precio_total) as montoTotal
                from pedido ped
                inner join pedido_prod pepr
                on pepr.pedido_id = ped.id
                inner join producto prod
                on pepr.producto_id = prod.id
                where ped.estado = 'confirmado'
                    and month(ped.fecha_pedido) = month(now())
                    and year(ped.fecha_pedido) = year(now())
                group by prod.id, prod.nombre
                order by montoTotal DESC
            `
        }

        const cantVendida = await this.statsEm.getConnection().execute(
            `
            select 
                DATE_FORMAT(ped.fecha_pedido, '%Y-%m') AS yearMes,
                sum(pepr.cantidad) as cantVendida
            from pedido ped
            inner join pedido_prod pepr
            on pepr.pedido_id = ped.id
            where ped.estado = 'confirmado'
                AND DAY(ped.fecha_pedido) BETWEEN 1 AND DAY(NOW())
                AND ped.fecha_pedido >= DATE_SUB(CURRENT_DATE, INTERVAL 6 MONTH)
            GROUP BY yearMes
            ORDER BY yearMes ASC
            `
        )

        const cantNoVendida = await this.statsEm.getConnection().execute(
            `
            select 
                count(DISTINCT prod.id) as cantNoVendida,
                (select count(*) from producto) as cantTotal
            from producto prod
            where prod.id not in (
                select pepr.producto_id
                from pedido ped
                inner join pedido_prod pepr
                on pepr.pedido_id = ped.id
                where ped.estado = 'confirmado'
                    and year(ped.fecha_pedido) = year(now())
                    and month(ped.fecha_pedido) = month(now())
            )
            `
        )

        const montoVentasRaw = await this.statsEm.getConnection().execute(buildHighestSoldQuery())

        return [cantVendida, cantNoVendida, montoVentasRaw]
    }

    public async getGeneralStats(tipo: 'producto' | 'categoria' | 'marca') {
        function buildHighestSoldQuery() {
            const joinStatement = tipo === 'producto' ? '' : `inner join ${tipo} on producto.${tipo}_id = ${tipo}.id`

            return `
                select ${tipo}.id, ${tipo}.nombre, sum(ped.precio_total) as montoTotal
                from pedido ped
                inner join pedido_prod pepr
                on pepr.pedido_id = ped.id
                inner join producto
                on pepr.producto_id = producto.id
                ${joinStatement}
                where ped.estado = 'confirmado'
                    and month(ped.fecha_pedido) = month(now())
                    and year(ped.fecha_pedido) = year(now())
                group by ${tipo}.id, ${tipo}.nombre
                order by montoTotal DESC
            `
        }

        return await this.statsEm.getConnection().execute(buildHighestSoldQuery())
    }


    public async getClienteStats() {     
        function buildGeoDistQuery(tipo: 'provincia' | 'ciudad') {
            const isCiudad = tipo === 'ciudad'

            return `
                WITH ${tipo}_totals AS (
                    SELECT 
                        cli.provincia as provincia,
                        ${isCiudad ? 'cli.ciudad as ciudad,' : ''}
                        COUNT(*) AS cantTotal
                    FROM cliente cli
                    WHERE 
                        MONTH(cli.fecha_ingreso) = MONTH(NOW()) AND 
                        YEAR(cli.fecha_ingreso) = YEAR(NOW())
                    GROUP BY cli.provincia ${isCiudad ? ', cli.ciudad' : ''}
                ),
                top_5 AS (
                    SELECT * 
                    FROM ${tipo}_totals 
                    ORDER BY cantTotal DESC 
                    LIMIT 5
                ),
                others AS (
                    SELECT 
                        ${isCiudad ? '"-" as provincia,' : ''}
                        'Otras' AS ${tipo}, 
                        SUM(cantTotal) AS cantTotal
                    FROM ${tipo}_totals
                    WHERE ${isCiudad ? '(provincia, ciudad)' : 'provincia'} NOT IN (SELECT ${isCiudad ? 'provincia, ciudad' : 'provincia'} FROM top_5)
                )
                SELECT * FROM top_5
                UNION ALL
                SELECT * FROM others
                ORDER BY cantTotal DESC
            `
        }

        function buildDiaQuery(order: 'ASC' | 'DESC') {
            return `
                SELECT 
                    DAY(cli.fecha_ingreso) AS dia, 
                    COUNT(*) AS cant 
                FROM cliente cli
                WHERE MONTH(cli.fecha_ingreso) = MONTH(NOW())
                    AND YEAR(cli.fecha_ingreso) = YEAR(NOW())
                GROUP BY DAY(cli.fecha_ingreso)
                ORDER BY cant ${order}
            `
        }

        function buildHighestSoldQuery(order: 'ASC' | 'DESC') {
            return `
                select cli.id, cli.nombre, sum(ped.precio_total) as montoTotal
                from pedido ped
                inner join cliente cli
                on cli.id = ped.cliente_id
                where ped.estado = 'confirmado'
                    and month(ped.fecha_pedido) = month(now())
                    and year(ped.fecha_pedido) = year(now())
                group by cli.id, cli.nombre
                order by montoTotal ${order}
                limit 5;
            `
        }

        const cantTotal = await this.statsEm.getConnection().execute(`
            select 
                month(cli.fecha_ingreso) as numMes, 
                count(*) as cantNueva,
                sum(count(*)) over (order by month(cli.fecha_ingreso)) as cantAcumulada
            from cliente cli
            group by numMes
            order by numMes ASC`
        )

        const cantTotalReiterante = await this.statsEm.getConnection().execute(`
            select count(*) as cantTotal
            from pedido ped
            inner join cliente cli
            on cli.id = ped.cliente_id
            where ped.estado = 'confirmado'
                and month(ped.fecha_pedido) = month(now())
                and year(ped.fecha_pedido) = year(now())
                and cli.fecha_ingreso >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01')
            limit 5`
        )

        const distCantProv = await this.statsEm.getConnection().execute(buildGeoDistQuery('provincia'))
        const distCantCiudad = await this.statsEm.getConnection().execute(buildGeoDistQuery('ciudad'))
        const highestClientes = await this.statsEm.getConnection().execute(buildHighestSoldQuery("DESC"))

        const maxDia = await this.statsEm.getConnection().execute(buildDiaQuery('DESC'))
        const minDia = await this.statsEm.getConnection().execute(buildDiaQuery('ASC'))

        const averageAge = await this.statsEm.getConnection().execute('select avg(DATEDIFF(NOW(), cli.fecha_ingreso)) as avgDias from cliente cli')

        return [cantTotal, highestClientes, cantTotalReiterante, distCantProv, distCantCiudad, maxDia, minDia, averageAge]
    }
}