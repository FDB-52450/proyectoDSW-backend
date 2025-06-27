import { Router } from 'express'
import { sanitizeProductoInput, sanitizeProductoFilters, findAll, findOne, add, update, remove} from './producto-controller.js'

export const productoRouter = Router()

productoRouter.get('/', sanitizeProductoFilters, findAll)
productoRouter.get('/:id', findOne)
productoRouter.post('/', sanitizeProductoInput, add)
productoRouter.put('/:id', sanitizeProductoInput, update)
productoRouter.patch('/:id', sanitizeProductoInput, update)
productoRouter.delete('/:id', remove)