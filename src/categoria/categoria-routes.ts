import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './categoria-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

import { validateCategoria } from '../middleware/validation/categoriaValidation.js'
import { validateId } from '../middleware/validation/idValidation.js'
import { handleValidation } from '../middleware/validation/validateInput.js'

export const categoriaRouter = Router()

categoriaRouter.get('/', findAll)
categoriaRouter.get('/:id', findOne)
categoriaRouter.post('/', authLogin, validateCategoria, handleValidation, add)
categoriaRouter.put('/:id', authLogin, validateId, validateCategoria, handleValidation, update)
categoriaRouter.patch('/:id', authLogin, validateId, validateCategoria, handleValidation, update)
categoriaRouter.delete('/:id', authLogin, validateId, handleValidation, remove)