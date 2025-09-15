import { Request, Response } from 'express'
import { PedidoRepository } from './pedido-repository.js'
import { Pedido } from './pedido-entity.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { errorLogger, pedidoLogger } from '../shared/loggers.js'
import { Cliente } from '../cliente/cliente-entity.js'
import { clienteObtain } from '../cliente/cliente-service.js'
import { ClienteDTO } from '../cliente/cliente-dto.js'
import { pedidoTransformDetalle, pedidoValidateDetalleStock, ValidationResult } from './pedido-helper.js'
import { AppError } from '../shared/errors.js'

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new PedidoRepository(em as SqlEntityManager)
}

async function findAll(req: Request, res: Response) {
  const repository = getRepo()
  const pedidos = await repository.findAll()

  if (pedidos.length == 0) {
    res.status(404).send({ message: 'No hay pedidos disponibles.'})
  } else {
    res.json({data: pedidos})
  }
}

async function findOne(req: Request, res: Response) {
  const id = Number(req.params.id)
  const repository = getRepo()
  const pedido = await repository.findOne({ id })

  if (!pedido) {
    res.status(404).send({ message: 'Pedido no encontrado.' })
  } else {
    res.json({ data: pedido })
  }
}

async function add(req: Request, res: Response) {
  const input = req.body
  const repository = getRepo()

  let cliente: Cliente

  try {
    cliente = await clienteObtain(req.body.cliente as ClienteDTO)
  } catch (err) {
    if (err instanceof AppError) {
        res.status(err.status).json({ error: err.message})
        return
    }

    errorLogger.error(err)
    res.status(500).json({ error: 'Error interno del servidor' })
    return
  }
  
  const resultDetalleTransformation = await pedidoTransformDetalle(input.detalle)
  
  if (resultDetalleTransformation instanceof ValidationResult) {
    res.status(422).json({error: 'VALIDACION_FALLIDA', details: resultDetalleTransformation.errors})
    return
  }

  const pedidoInput = new Pedido(input.tipoEntrega, input.tipoPago, resultDetalleTransformation, cliente, input.fechaEntrega)
  const resultCheck = pedidoValidateDetalleStock(pedidoInput, true)

  if (resultCheck.result) {
    res.status(422).json({error: 'VALIDACION_FALLIDA', details: resultCheck.errors})
    return
  }
  
  const pedido = await repository.add(pedidoInput)
  
  if (!pedido) {
    res.status(500).send({ message: 'Algo ha salido mal, intente de nuevo mas tarde.' })
  } else {
    pedidoLogger.info({action: 'create', data: pedido})

    res.status(201).send({ message: 'Pedido creado con exito.', data: pedido })
  }
}

async function update(req: Request, res: Response) {
  req.body.id = Number(req.params.id)

  const input = req.body
  const repository = getRepo()

  let pedido: Pedido | null

  try {
    pedido = await repository.update(input)
  } catch {
    res.status(401).send({ message: 'Transaccion no valida.' })
    return
  }

  if (!pedido) {
    res.status(404).send({ message: 'Pedido no encontrado.' })
  } else {
    pedidoLogger.info({action: 'update', data: req.body})

    res.status(200).send({ message: 'Pedido actualizado con exito.', data: pedido })
  }
}

async function validate(req: Request, res: Response) {
    const input = req.body
    const resultDetalleTransformation = await pedidoTransformDetalle(input.detalle)

    if (resultDetalleTransformation instanceof ValidationResult) {
        res.status(422).json({error: 'VALIDACION_FALLIDA', details: resultDetalleTransformation.errors})
        return
    }

    const dummyCliente = new Cliente('', '', '', '', '', '', '', '', '') // FUNNY PATCH TO NOT CHANGE PEDIDO STRUCTURE
    const pedidoInput = new Pedido(input.tipoEntrega, input.tipoPago, resultDetalleTransformation, dummyCliente, input.fechaEntrega)

    const resultCheck = pedidoValidateDetalleStock(pedidoInput, false)

    if (resultCheck.result) {
        res.status(422).json({error: 'VALIDACION_FALLIDA', details: resultCheck.errors})
        return
    }

    res.status(201).send({message: 'Pedido validado con exito.'})
}

export { findAll, findOne, add, update, validate }
