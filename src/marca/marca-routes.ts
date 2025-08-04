import { Router } from 'express'
import { findAll, findOne, add, update, remove } from './marca-controller.js'

import { upload } from '../middleware/multer.js'
import { authLogin } from '../middleware/loginAuth.js'
import { createContext } from '../middleware/mikroOrmContext.js'

import { validateMarca } from '../middleware/validation/marcaValidation.js'
import { validateId } from '../middleware/validation/idValidation.js'
import { validateImagen } from '../middleware/validation/imagenValidation.js'
import { handleValidation } from '../middleware/validation/validateInput.js'

export const marcaRouter = Router()

marcaRouter.get('/', findAll)
marcaRouter.get('/:id', findOne)
marcaRouter.post('/', authLogin, upload.single('image'), createContext, validateMarca('create'), validateImagen, handleValidation, add)
marcaRouter.put('/:id', authLogin, upload.single('image'), createContext, validateId, validateMarca('update'), validateImagen, handleValidation, update)
marcaRouter.patch('/:id', authLogin, upload.single('image'), createContext, validateId, validateMarca('update'), validateImagen, handleValidation, update)
marcaRouter.delete('/:id', authLogin, validateId, handleValidation, remove)