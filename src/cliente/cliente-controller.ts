import { Request, Response } from 'express'
import { ClienteDTO } from './cliente-dto.js'
import { clienteFindAll, clienteFindOne, clienteCreate, clienteUpdate, clienteRemove } from './cliente-service.js'

import { AppError } from './cliente-errors.js'

async function findAll(req: Request, res: Response) {
    try {
        const clientes = await clienteFindAll()

        res.status(201).json({ data: clientes })
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

export { findAll, findOne, add, update, remove }
