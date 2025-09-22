import { Router } from 'express'
import { findAll, findOne, add, update, remove, suspend, reactivate } from './cliente-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

import { validateCliente } from '../middleware/validation/clienteValidation.js'
import { validateId } from '../middleware/validation/idValidation.js'
import { validateBan } from '../middleware/validation/banValidation.js'

import { handleValidation } from '../middleware/validation/validateInput.js'

export const clienteRouter = Router()

clienteRouter.get('/', authLogin, findAll)
clienteRouter.get('/:id', authLogin, findOne)
clienteRouter.post('/:id/suspend', authLogin, validateId, validateBan, suspend)
clienteRouter.post('/:id/reactivate', authLogin, validateId, reactivate)

// NOTE: The endpoints below are only meant for admin use or for potential client login implementation in the future.

clienteRouter.post('/', authLogin, validateCliente(), handleValidation, add)
clienteRouter.put('/:id', authLogin, validateId, validateCliente('', 'update'), handleValidation, update)
clienteRouter.patch('/:id', authLogin, validateId, validateCliente('', 'update'), handleValidation, update)
clienteRouter.delete('/:id', authLogin, validateId, handleValidation, remove)