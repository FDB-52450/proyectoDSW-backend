import { Router } from 'express'
import { findAll, findOne, add, update, remove, login, logout } from './administrador-controller.js'

import { authLogin } from '../middleware/loginAuth.js'
import { superAuthLogin } from '../middleware/superLoginAuth.js'

import { validateAdmin } from '../middleware/validation/adminValidation.js'
import { validateId } from '../middleware/validation/idValidation.js'
import { handleValidation } from '../middleware/validation/validateInput.js'

export const administradorRouter = Router()

administradorRouter.post('/login', validateAdmin, handleValidation, login)
administradorRouter.get('/logout', authLogin, logout)

administradorRouter.get('/', superAuthLogin, findAll)
administradorRouter.get('/:id', superAuthLogin, findOne)
administradorRouter.post('/', superAuthLogin, validateAdmin, handleValidation, add)
administradorRouter.put('/:id', superAuthLogin, validateId, validateAdmin, handleValidation, update)
administradorRouter.patch('/:id', superAuthLogin, validateId, validateAdmin, handleValidation, update)
administradorRouter.delete('/:id', superAuthLogin, validateId, handleValidation, remove)