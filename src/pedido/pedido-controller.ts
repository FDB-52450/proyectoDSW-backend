import { Request, Response, NextFunction } from 'express'
import { PedidoRepository } from './pedido-repository.js'
import { Pedido } from './pedido-entity.js'

import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'
import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { ProductoRepository } from '../producto/producto-repository.js'

function sanitizePedidoInput(req: Request, res: Response, next: NextFunction) {
  const validStates = ['confirmado', 'cancelado']

  req.body.sanitizedInput = {
    tipoEntrega: req.body.tipoEntrega,
    tipoPago: req.body.tipoPago,
    fechaEntrega: req.body.fechaEntrega,
    detalle: req.body.detalle,
    estado: req.body.estado
  }
  
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  if (!validStates.includes(req.body.sanitizedInput.estado) && (req.method === "PATCH" || req.method === "PUT")) {
    res.status(401).send({ message: 'Estado no valido.' })
    return
  }

  next()
}

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
  const input = req.body.sanitizedInput
  const repository = getRepo()
  const prodRepo = new ProductoRepository(RequestContext.getEntityManager()?.fork() as SqlEntityManager)

  // THIS CODE REPLACES EACH PRODUCT ID IN THE DETALLE WITH THE ACTUAL PRODUCT ENTITY

  const detalleWithProducts = await Promise.all(input.detalle.map(async (item: { cantidad: number, productoId: number }) => {
    const producto = await prodRepo.findOne({ id: item.productoId })

    if (!producto) {
      res.status(400).send({ message: `Producto con id ${item.productoId} no existe.` })
      throw new Error('Producto no encontrado') // TEMPORAL FIX
    }

    return new PedidoProd(item.cantidad, producto)
  }))

  const pedidoInput = new Pedido(
    input.tipoEntrega,
    input.tipoPago,
    detalleWithProducts,
    input.fechaEntrega
  )

  const check = pedidoInput.checkDetalle()

  if (!check) {
    res.status(400).send({ message: 'Detalle del pedido no válido' })
  } else {
    const pedido = await repository.add(pedidoInput)

    if (!pedido) {
      res.status(500).send({ message: 'Algo ha salido mal, intente de nuevo mas tarde.' })
    } else {
      pedido.aumentarStockReservado()
      res.status(201).send({ message: 'Pedido creado con exito.', data: pedido })
    }
  }
}

async function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = Number(req.params.id)
  const input = req.body.sanitizedInput
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
    res.status(200).send({ message: 'Pedido actualizado con exito.', data: pedido })
  }
}

function remove(req: Request, res: Response) {
  /*const id = Number(req.params.id)
  const pedido = repository.delete({ id })

  if (!pedido) {
    res.status(404).send({ message: 'Pedido not found' })
  } else {
    res.status(200).send({ message: 'Pedido deleted successfully' })

    pedido.reducirStockReservado()
  }*/

  res.status(501).send({ message: 'Not implemented' }) 
  
  // Won't be implemented, should be removed later.
  // To remove a pedido, it should be cancelled, not deleted.
}

export { sanitizePedidoInput, findAll, findOne, add, update, remove }
