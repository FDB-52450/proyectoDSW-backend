import { Router } from 'express'
import { sanitizeMarcaInput, findAll, findOne, add, update, remove } from './marca-controller.js'
import { upload } from '../middleware/multer.js'
import { authLogin } from '../middleware/loginAuth.js'

export const marcaRouter = Router()

marcaRouter.get('/', findAll)
marcaRouter.get('/:id', findOne)
marcaRouter.post('/', authLogin, upload.single('image'), sanitizeMarcaInput, add)
marcaRouter.put('/:id', authLogin, upload.single('image'), sanitizeMarcaInput, update)
marcaRouter.patch('/:id', authLogin, upload.single('image'), sanitizeMarcaInput, update)
marcaRouter.delete('/:id', authLogin, remove)