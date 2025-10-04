import { Request, Response } from 'express'

import { statsGetCategoriaStats, statsGetClienteStats, statsGetMarcaStats, statsGetPedidoStats, statsGetProductoStats } from './stats-service.js'

async function getPedidoStats(req: Request, res: Response) {
    try {
        const pedidoStats = await statsGetPedidoStats()

        res.status(201).json({ data: pedidoStats })
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function getProductoStats(req: Request, res: Response) {
    try {
        const clientes = await statsGetProductoStats()

        res.status(201).json({ data: clientes })
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function getMarcaStats(req: Request, res: Response) {
    try {
        const clientes = await statsGetMarcaStats()

        res.status(201).json({ data: clientes })
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function getCategoriaStats(req: Request, res: Response) {
    try {
        const clientes = await statsGetCategoriaStats()

        res.status(201).json({ data: clientes })
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function getClienteStats(req: Request, res: Response) {
    try {
        const clientes = await statsGetClienteStats()

        res.status(201).json({ data: clientes })
    } catch (err) {
        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}


export { getPedidoStats, getProductoStats, getCategoriaStats, getMarcaStats, getClienteStats }
