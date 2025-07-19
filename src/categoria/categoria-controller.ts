import { Request, Response, NextFunction } from 'express'
import { CategoriaRepository } from './categoria-repository.js'
import { Categoria } from './categoria-entity.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

function sanitizeCategoriaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  
  next()
}

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new CategoriaRepository(em as SqlEntityManager)
}

async function findAll(req: Request, res: Response) {
  const repository = getRepo()
  const categorias = await repository.findAll()

  if (categorias.length == 0) {
    res.status(404).send({ message: 'No hay categorias disponibles.'})
  } else {
    res.json({data: categorias})
  }
}

async function findOne(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const categoria = await repository.findOne({ id })

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  } else {
    res.json({ data: categoria })
  }
}

async function add(req: Request, res: Response) {
  const repository = getRepo()
  const input = req.body.sanitizedInput

  const categoriaInput = RequestContext.getEntityManager()!.create(Categoria, input)
  const categoria = await repository.add(categoriaInput)

  if (!categoria) {
    res.status(409).send({ message: 'Categoria ya existente.'})
  } else {
    res.status(201).send({ message: 'Categoria creada con exito.', data: categoria})
  }
}

async function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = Number(req.params.id)
  
  const repository = getRepo()
  const categoria = await repository.update(req.body.sanitizedInput)

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  } else {
    res.status(200).send({ message: 'Categoria actualizada con exito.', data: categoria })
  }
}

async function remove(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const categoria = await repository.delete({ id })

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  } else {
    res.status(200).send({ message: 'Categoria borrada con exito.' })
  }
}

export { sanitizeCategoriaInput, findAll, findOne, add, update, remove }
