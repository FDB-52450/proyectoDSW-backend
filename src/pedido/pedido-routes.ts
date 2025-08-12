import { Router } from 'express'
import { findAll, findOne, add, update, validate } from './pedido-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

import { validatePedido } from '../middleware/validation/pedidoValidation.js'
import { validateId } from '../middleware/validation/idValidation.js'
import { handleValidation } from '../middleware/validation/validateInput.js'

export const pedidoRouter = Router()

pedidoRouter.get('/', authLogin, findAll)
pedidoRouter.get('/:id', authLogin, findOne)
pedidoRouter.post('/validate', validatePedido('validate'), handleValidation, validate)
pedidoRouter.post('/', validatePedido('create'), handleValidation, add)
pedidoRouter.put('/:id', authLogin, validateId, validatePedido('update'), handleValidation, update)
pedidoRouter.patch('/:id', authLogin, validateId, validatePedido('update'), handleValidation, update)