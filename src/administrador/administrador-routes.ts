import { Router } from 'express'
import { sanitizeAdminInput, login } from './administrador-controller.js'

export const administradorRouter = Router()

administradorRouter.post('/login', sanitizeAdminInput, login)
