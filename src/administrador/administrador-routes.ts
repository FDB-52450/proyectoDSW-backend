import { Router } from 'express'
import { login, logout} from './administrador-controller.js'

import { authLogin } from '../middleware/loginAuth.js'

import { validateAdmin } from '../middleware/validation/adminValidation.js'
import { handleValidation } from '../middleware/validation/validateInput.js'

export const administradorRouter = Router()

administradorRouter.post('/login', validateAdmin, handleValidation, login)
administradorRouter.get('/logout', authLogin, logout)