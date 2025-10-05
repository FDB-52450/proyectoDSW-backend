import { Request, Response } from 'express'
import { ClienteDTO } from './cliente-dto.js'
import { clienteFindAll, clienteFindOne, clienteCreate, clienteUpdate, clienteRemove, clienteSuspend, clienteReactivate, clienteGetStatus } from './cliente-service.js'

import { AppError } from '../shared/errors.js'
import { auditLogger } from '../shared/loggers.js'
import { ClienteFilters } from './clienteFilters-entity.js'

async function findAll(req: Request, res: Response) {
    try {
        const filters: ClienteFilters = req.query || undefined
        const page = Number(req.query.page ?? 1)
        
        const [clientes, pagination] = await clienteFindAll(page, filters)

        res.status(201).json({ data: clientes, pagination: pagination})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function findOne(req: Request, res: Response) {
    const id = Number(req.params.id)

    try {
        const cliente = await clienteFindOne(id)

        res.status(201).json({data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function add(req: Request, res: Response) {
    const clienteData: ClienteDTO = req.body

    try {
        const cliente = await clienteCreate(clienteData)

        res.status(201).json({ message: 'Cliente creado con exito.', data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function update(req: Request, res: Response) {
    req.body.id = Number(req.params.id)
    const clienteData: ClienteDTO = req.body

    try {
        const cliente = await clienteUpdate(clienteData)

        res.status(201).json({ message: 'Cliente actualizado con exito.', data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function remove(req: Request, res: Response) {
    const id = Number(req.params.id)

    try {
        const cliente = await clienteRemove(id)

        res.status(201).json({ message: 'Cliente borrado con exito.', data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function suspend(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { duracion, razon } = req.body

    try {
        const cliente = await clienteSuspend(id, duracion, razon)

        auditLogger.info({entity: 'cliente', action: 'suspend', user: req.session.user, data: cliente})

        res.status(201).json({ message: 'Cliente suspendido con exito.', data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function reactivate(req: Request, res: Response) {
    const id = Number(req.params.id)

    try {
        const cliente = await clienteReactivate(id)

        auditLogger.info({entity: 'cliente', action: 'reactivate', user: req.session.user, data: cliente})

        res.status(201).json({ message: 'Cliente reactivado con exito.', data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

async function status(req: Request, res: Response) {
    const clienteData: ClienteDTO = req.body

    try {
        const cliente = await clienteGetStatus(clienteData)

        res.status(201).json({ data: cliente})
    } catch (err) {
        if (err instanceof AppError) {
            res.status(err.status).json({ error: err.message })
            return
        }

        res.status(500).json({ error: 'Error interno del servidor' })
        return
    }
}

export { findAll, findOne, add, update, remove, suspend, reactivate, status }
