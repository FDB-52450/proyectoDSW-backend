import { Router } from 'express'
import { sanitizeProductoInput, sanitizeProductoFilters, findAll, findOne, add, update, remove} from './producto-controller.js'

import { createContext } from '../middleware/mikroOrmContext.js'
import { upload } from '../middleware/multer.js'
import { authLogin } from '../middleware/loginAuth.js'
import { create } from 'domain'

export const productoRouter = Router()

productoRouter.get('/', sanitizeProductoFilters, findAll)
productoRouter.get('/:id', findOne)
productoRouter.post('/', authLogin, upload.array('images', 4), createContext, sanitizeProductoInput, add)
productoRouter.put('/:id', authLogin, upload.array('images', 4), createContext, sanitizeProductoInput, update)
productoRouter.patch('/:id', authLogin, upload.array('images', 4), createContext, sanitizeProductoInput, update)
productoRouter.delete('/:id', authLogin, remove)