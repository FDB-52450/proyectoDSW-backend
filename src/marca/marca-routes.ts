import { Router } from 'express'
import { sanitizeMarcaInput, findAll, findOne, add, update, remove } from './marca-controller.js'

export const marcaRouter = Router()

marcaRouter.get('/', findAll)
marcaRouter.get('/:id', findOne)
marcaRouter.post('/', sanitizeMarcaInput, add)
marcaRouter.put('/:id', sanitizeMarcaInput, update)
marcaRouter.patch('/:id', sanitizeMarcaInput, update)
marcaRouter.delete('/:id', remove)