import { Request, Response, NextFunction } from 'express'
import { MarcaRepository } from './marca-repository.js'
import { Marca } from './marca-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

const repository = new MarcaRepository()

function sanitizeMarcaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    imagen: req.file?.filename || undefined,
    operacion: req.body.operacion // ONLY FOR UPDATE API ['remove', 'keep']
  }

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
  const marca = repository.findOne({ id })

  if (!marca) {
    res.status(404).send({ message: 'Marca not found' })
  } else {
    res.json({ data: marca })
  }
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput
  const imagen = new Imagen(input.imagen, true)

  const marcaInput = new Marca(
    input.nombre,
    imagen,
  )

  const marca = repository.add(marcaInput)
  res.status(201).send({ message: 'Marca creada', data: marca})
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id

  // THIS IS A QUESTIONABLE FIX AT BEST

  if (req.body.sanitizedInput.imagen) {
    req.body.sanitizedInput.imagen = new Imagen(req.body.sanitizedInput.imagen, true)
  } else if (req.body.sanitizedInput.operacion === 'remove') {
    req.body.sanitizedInput.imagen = new Imagen('remove')
  } else {
    req.body.sanitizedInput.imagen = new Imagen('keep')
  }

  delete req.body.sanitizedInput.operacion

  const marca = repository.update(req.body.sanitizedInput)

  if (!marca) {
    res.status(404).send({ message: 'Marca not found' })
  } else {
    res.status(200).send({ message: 'Marca updated successfully', data: marca })
  }
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const marca = repository.delete({ id })

  if (!marca) {
    res.status(404).send({ message: 'Marca not found' })
  } else {
    res.status(200).send({ message: 'Marca deleted successfully' })
  }
}

export { sanitizeMarcaInput, findAll, findOne, add, update, remove }
