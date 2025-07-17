import { Router } from 'express'
import { sanitizeCategoriaInput, findAll, findOne, add, update, remove } from './categoria-controller.js'
import { authLogin } from '../middleware/loginAuth.js'

export const categoriaRouter = Router()

categoriaRouter.get('/', findAll)
categoriaRouter.get('/:id', findOne)
categoriaRouter.post('/', authLogin, sanitizeCategoriaInput, add)
categoriaRouter.put('/:id', authLogin, sanitizeCategoriaInput, update)
categoriaRouter.patch('/:id', authLogin, sanitizeCategoriaInput, update)
categoriaRouter.delete('/:id', authLogin, remove)