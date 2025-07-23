import { Router } from 'express'
import { sanitizeMarcaInput, findAll, findOne, add, update, remove } from './marca-controller.js'

import { upload } from '../middleware/multer.js'
import { authLogin } from '../middleware/loginAuth.js'
import { createContext } from '../middleware/mikroOrmContext.js'

export const marcaRouter = Router()

marcaRouter.get('/', findAll)
marcaRouter.get('/:id', findOne)
marcaRouter.post('/', authLogin, upload.single('image'), createContext, sanitizeMarcaInput, add)
marcaRouter.put('/:id', authLogin, upload.single('image'), createContext, sanitizeMarcaInput, update)
marcaRouter.patch('/:id', authLogin, upload.single('image'), createContext, sanitizeMarcaInput, update)
marcaRouter.delete('/:id', authLogin, remove)