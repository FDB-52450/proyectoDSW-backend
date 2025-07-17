import { Router } from 'express'
import { sanitizePedidoInput, findAll, findOne, add, update, updateEstado, remove } from './pedido-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

export const pedidoRouter = Router()

pedidoRouter.get('/', authLogin, findAll)
pedidoRouter.get('/:id', authLogin, findOne)
pedidoRouter.post('/', authLogin, sanitizePedidoInput, add)
pedidoRouter.put('/:id', authLogin, sanitizePedidoInput, update)
pedidoRouter.patch('/:id', authLogin, sanitizePedidoInput, update)
pedidoRouter.patch('/:id/estado', authLogin, updateEstado)
pedidoRouter.delete('/:id', authLogin, remove)