import { Request, Response, NextFunction } from 'express'
import { PedidoRepository } from './pedido-repository.js'
import { Pedido } from './pedido-entity.js'

import { ProductoRepository } from '../producto/producto-repository.js'
import { PedidoProd } from '../pedidoprod/pedidoprod-entity.js'

const repository = new PedidoRepository()
const productoRepository = new ProductoRepository()

function sanitizePedidoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    tipoEntrega: req.body.tipoEntrega,
    tipoPago: req.body.tipoPago,
    fechaEntrega: req.body.fechaEntrega,
    detalle: req.body.detalle
  }
  
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })

  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const pedido = repository.findOne({ id })

  if (!pedido) {
    res.status(404).send({ message: 'Pedido not found' })
  }
  
  res.json({ data: pedido })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  // THIS CODE REPLACES EACH PRODUCT ID IN THE DETALLE WITH THE ACTUAL PRODUCT ENTITY

  const detalleWithProducts = input.detalle.map((item: { cantidad: number, productoId: string }) => {
    const producto = productoRepository.findOne({ id: item.productoId })

    console.log(`Producto buscado: ${item.productoId}`, producto)

    if (!producto) {
      res.status(400).send({ message: `Producto con id ${item.productoId} no existe.` })
      throw new Error('Producto no encontrado') // TEMPORAL FIX
    }

    return new PedidoProd(item.cantidad, producto)
  })

  const pedidoInput = new Pedido(
    input.tipoEntrega,
    input.tipoPago,
    input.fechaEntrega,
    detalleWithProducts
  )

  const check = pedidoInput.checkDetalle()

  if (!check) {
    res.status(400).send({ message: 'Detalle del pedido no válido' })
  } else {
    const pedido = repository.add(pedidoInput)
    pedido?.aumentarStockReservado() // Temporal fix (likely permanent)

    res.status(201).send({ message: 'Pedido creado.', data: pedido })
  }
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const pedido = repository.update(req.body.sanitizedInput)

  // Update is not meant to be able to modify detalle, so it doesn't call any stock modifiying methods.

  if (!pedido) {
    res.status(404).send({ message: 'Pedido not found' })
  } else {
    res.status(200).send({ message: 'Pedido updated successfully', data: pedido })
  }
}

function updateEstado(req: Request, res: Response) {
  const id = req.params.id
  const nuevoEstado = req.body.nuevoEstado

  const pedido = repository.findOne({ id })

  if (!pedido) {
    res.status(404).send({ message: 'Pedido not found' })
  } else {
    const result = pedido.actualizarEstado(nuevoEstado)

    if (!result) {
      res.status(400).send({ message: 'Estado no válido o transición no permitida' })
      return
    }

    res.status(200).send({ message: 'Estado del pedido actualizado', data: pedido })
  }
}

function remove(req: Request, res: Response) {
  /*const id = req.params.id
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

export { sanitizePedidoInput, findAll, findOne, add, update, updateEstado, remove }
