import { Router } from 'express'
import { sanitizeProductoInput, sanitizeProductoFilters, findAll, findOne, add, update, remove} from './producto-controller.js'

import { upload } from '../middleware/multer.js'
import { authLogin } from '../middleware/loginAuth.js'

export const productoRouter = Router()

productoRouter.get('/', sanitizeProductoFilters, findAll)
productoRouter.get('/:id', findOne)
productoRouter.post('/', authLogin, upload.array('images', 4), sanitizeProductoInput, add)
productoRouter.put('/:id', authLogin, sanitizeProductoInput, update)
productoRouter.patch('/:id', authLogin, sanitizeProductoInput, update)
productoRouter.delete('/:id', authLogin, remove)