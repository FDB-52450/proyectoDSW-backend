import { Router } from 'express'
import { sanitizePedidoInput, findAll, findOne, add, update, remove } from './pedido-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

export const pedidoRouter = Router()

pedidoRouter.get('/', authLogin, findAll)
pedidoRouter.get('/:id', authLogin, findOne)
pedidoRouter.post('/', sanitizePedidoInput, add) // TODO: Add loads of validation to this endpoint
pedidoRouter.put('/:id', authLogin, sanitizePedidoInput, update)
pedidoRouter.patch('/:id', authLogin, sanitizePedidoInput, update)
pedidoRouter.delete('/:id', authLogin, remove)