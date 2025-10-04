import { Router } from 'express'
import { findAll, findOne, add, update, remove} from './producto-controller.js'

import { validateProducto } from '../middleware/validation/productoValidation.js'
import { validateProductoFilters } from '../middleware/validation/filters/productoFiltersValidation.js'
import { validateId } from '../middleware/validation/idValidation.js'
import { validateImagen } from '../middleware/validation/imagenValidation.js'
import { handleValidation } from '../middleware/validation/validateInput.js'

import { createContext } from '../middleware/mikroOrmContext.js'
import { upload } from '../middleware/multer.js'
import { authLogin } from '../middleware/loginAuth.js'

export const productoRouter = Router()

productoRouter.get('/', validateProductoFilters, handleValidation, findAll)
productoRouter.get('/:id', findOne)
productoRouter.post('/', authLogin, upload.array('images', 4), createContext, validateImagen, validateProducto('create'), handleValidation, add)
productoRouter.put('/:id', authLogin, upload.array('images', 4), createContext, validateId, validateImagen, validateProducto('update'), handleValidation, update)
productoRouter.patch('/:id', authLogin, upload.array('images', 4), createContext, validateId, validateImagen, validateProducto('update'), handleValidation, update)
productoRouter.delete('/:id', authLogin, validateId, handleValidation, remove)