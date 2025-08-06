import { Request, Response, NextFunction } from 'express'
import { MarcaRepository } from './marca-repository.js'
import { Marca } from './marca-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { auditLogger } from '../shared/loggers.js'

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new MarcaRepository(em as SqlEntityManager)
}

async function findAll(req: Request, res: Response) {
  const repository = getRepo()
  const marcas = await repository.findAll()

  if (marcas.length == 0) {
    res.status(404).send({ message: 'No hay categorias disponibles.'})
  } else {
    res.json({data: marcas})
  }
}

async function findOne(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const marca = await repository.findOne({ id })

  if (!marca) {
    res.status(404).send({ message: 'Marca no encontrada.' })
  } else {
    res.json({ data: marca })
  }
}

async function add(req: Request, res: Response) {
  const input = req.body
  const repository = getRepo()
  const imagen = input.imagen ? new Imagen(input.imagen.buffer) : null

  const marcaInput = new Marca(
    input.nombre,
    imagen,
  )

  const check = await repository.checkConstraint(marcaInput)

  if (!check) {
    const marca = await repository.add(marcaInput)

    if (!marca) {
      res.status(500).send({ message: 'Ocurrio un error, intente mas tarde.' })
    } else {
      auditLogger.info({entity: 'marca', action: 'create', user: req.session.user, data: marcaInput})

      res.status(201).send({ message: 'Marca creada con exito.', data: marca })
    }
  } else {
    res.status(409).send({ message: 'Marca ya existente.' })
  }
}

async function update(req: Request, res: Response) {
  // TODO: Consider reworking how this functions, since currently if there's no req.body.keepImage the image will just be deleted (intended but odd behaviour)
  req.body.id = Number(req.params.id)
  req.body.imagen = req.body.imagen ? new Imagen(req.body.imagen.buffer) : null

  const repository = getRepo()
  const input = req.body

  if (req.body.keepImage) {
    delete input.imagen
  }

  let check = false

  if (input.nombre) {
    check = await repository.checkConstraint(input)
  }

  if (!check) {
    const marca = await repository.update(input)

    if (!marca) {
      res.status(404).send({ message: 'Marca no encontrada.' })
    } else {
      auditLogger.info({entity: 'marca', action: 'update', user: req.session.user, data: req.body})

      res.status(200).send({ message: 'Marca actualizada con exito.', data: marca })
    }
  } else {
    res.status(401).send({ message: 'Nombre proporcionado de la marca ya esta en uso.'})
  }
}

async function remove(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const marca = await repository.delete({ id })

  if (!marca) {
    res.status(404).send({ message: 'Marca no encontrada.' })
  } else {
    auditLogger.info({entity: 'marca', action: 'delete', user: req.session.user, data: marca})

    res.status(200).send({ message: 'Marca borrada con exito.' })
  }
}

export { findAll, findOne, add, update, remove }
