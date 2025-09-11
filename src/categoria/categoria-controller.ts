import { Request, Response } from 'express'
import { CategoriaRepository } from './categoria-repository.js'
import { Categoria } from './categoria-entity.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { auditLogger } from '../shared/loggers.js'

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
  const input = req.body
  const categoriaInput = new Categoria(
    input.nombre,
    input.duracionGarantia,
    input.stockLimit
  )

  const check = await repository.checkConstraint(input)

  if (!check) {
    const categoria = await repository.add(categoriaInput)

    if (!categoria) {
      res.status(409).send({ message: 'Categoria ya existente.'})
    } else {
      auditLogger.info({entity: 'categoria', action: 'create', user: req.session.user, data: categoria})

      res.status(201).send({ message: 'Categoria creada con exito.', data: categoria})
    }
  } else {
    res.status(409).send({ message: 'Categoria ya existente.' })
  }
}

async function update(req: Request, res: Response) {
  req.body.id = Number(req.params.id)
  
  const repository = getRepo()
  const input = req.body
  const check = await repository.checkConstraint(input)

  if (!check) {
    const categoria = await repository.update(input)

    if (!categoria) {
      res.status(404).send({ message: 'Categoria no encontrada.' })
    } else {
      auditLogger.info({entity: 'categoria', action: 'update', user: req.session.user, data: req.body})

      res.status(200).send({ message: 'Categoria actualizada con exito.', data: categoria })
    }
  } else {
    res.status(409).send({ message: 'Nombre de categoria ya en uso.' })
  }
}

async function remove(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const categoria = await repository.delete({ id })

  if (!categoria) {
    res.status(404).send({ message: 'Categoria no encontrada.' })
  } else {
    auditLogger.info({entity: 'categoria', action: 'delete', user: req.session.user, data: categoria})

    res.status(200).send({ message: 'Categoria borrada con exito.' })
  }
}

export { findAll, findOne, add, update, remove }
