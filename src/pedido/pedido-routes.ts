import { Router } from 'express'
import { sanitizePedidoInput, findAll, findOne, add, update, updateEstado, remove } from './pedido-controller.js'

export const pedidoRouter = Router()

pedidoRouter.get('/', findAll)
pedidoRouter.get('/:id', findOne)
pedidoRouter.post('/', sanitizePedidoInput, add)
pedidoRouter.put('/:id', sanitizePedidoInput, update)
pedidoRouter.patch('/:id', sanitizePedidoInput, update)
pedidoRouter.patch('/:id/estado', updateEstado)
pedidoRouter.delete('/:id', remove)