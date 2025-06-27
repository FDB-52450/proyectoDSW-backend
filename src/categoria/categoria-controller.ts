import { Request, Response, NextFunction } from 'express'
import { CategoriaRepository } from './categoria-repository.js'
import { Categoria } from './categoria-entity.js'

const repository = new CategoriaRepository()

function sanitizeCategoriaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  
  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const categoria = repository.findOne({ id })

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  }
  
  res.json({ data: categoria })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const categoriaInput = new Categoria(
    input.nombre,
  )

  const categoria = repository.add(categoriaInput)
  res.status(201).send({ message: 'Categoria creada.', data: categoria})
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const categoria = repository.update(req.body.sanitizedInput)

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  }

  res.status(200).send({ message: 'Categoria actualizada con exito.', data: categoria })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const categoria = repository.delete({ id })

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  } else {
    res.status(200).send({ message: 'Categoria borrada con exito.' })
  }
}

export { sanitizeCategoriaInput, findAll, findOne, add, update, remove }
