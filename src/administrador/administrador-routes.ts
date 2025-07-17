import { Router } from 'express'
import { sanitizeAdminInput, login, logout} from './administrador-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

export const administradorRouter = Router()

administradorRouter.post('/login', sanitizeAdminInput, login)
administradorRouter.get('/logout', authLogin, logout)