import { Router } from 'express'
import { sanitizePedidoInput, findAll, findOne, add, update, remove } from './pedido-controller.js'

export const productoRouter = Router()

productoRouter.get('/', findAll)
productoRouter.get('/:id', findOne)
productoRouter.post('/', sanitizePedidoInput, add)
productoRouter.put('/:id', sanitizePedidoInput, update)
productoRouter.patch('/:id', sanitizePedidoInput, update)
productoRouter.delete('/:id', remove)