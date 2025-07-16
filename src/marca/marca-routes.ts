import { Router } from 'express'
import { sanitizeMarcaInput, findAll, findOne, add, update, remove } from './marca-controller.js'
import { upload } from '../middleware/multer.js'

export const marcaRouter = Router()

marcaRouter.get('/', findAll)
marcaRouter.get('/:id', findOne)
marcaRouter.post('/', upload.single('image'), sanitizeMarcaInput, add)
marcaRouter.put('/:id', upload.single('image'), sanitizeMarcaInput, update)
marcaRouter.patch('/:id', upload.single('image'), sanitizeMarcaInput, update)
marcaRouter.delete('/:id', remove)