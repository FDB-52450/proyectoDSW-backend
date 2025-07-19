import { Request, Response, NextFunction } from 'express'
import { MarcaRepository } from './marca-repository.js'
import { Marca } from './marca-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'
import { ImagenRepository } from '../imagen/imagen-repository.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

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

  if (!req.body.sanitizedInput.nombre) {
    res.status(401).send({ message: 'Faltan atributos de marca.' })
    return
  } // DONE OUTSIDE DUE TO FOREACH NOT RESPECTING RETURN

  next()
}

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
  const input = req.body.sanitizedInput
  const repository = getRepo()
  let imagen: Imagen

  if (input.imagen) {
    imagen = new Imagen(input.imagen, true)
  } else {
    const em = RequestContext.getEntityManager()
    const imagenRepo = new ImagenRepository(em?.fork() as SqlEntityManager)

    imagen = await imagenRepo.findTemplate()
  }

  const marcaInput = new Marca(
    input.nombre,
    imagen,
  )

  const marca = await repository.add(marcaInput)

  if (!marca) {
    res.status(409).send({ message: 'Marca ya existente.'})
  } else {
    res.status(201).send({ message: 'Marca creada con exito.', data: marca})
  }
}

async function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = Number(req.params.id)
  const repository = getRepo()

  // THIS IS A QUESTIONABLE FIX

  if (req.body.sanitizedInput.imagen) {
    req.body.sanitizedInput.imagen = new Imagen(req.body.sanitizedInput.imagen, true)
  } else if (req.body.sanitizedInput.operacion === 'remove') {
    req.body.sanitizedInput.imagen = new Imagen('remove')
  } else {
    req.body.sanitizedInput.imagen = new Imagen('keep')
  }

  delete req.body.sanitizedInput.operacion

  let marca: Marca | null

  try {
    marca = await repository.update(req.body.sanitizedInput)
  } catch {
    res.status(401).send({ message: 'Nombre proporcionado de la marca ya esta en uso.'})
    return
  }

  if (!marca) {
    res.status(404).send({ message: 'Marca no encontrada.' })
  } else {
    res.status(200).send({ message: 'Marca actualizada con exito.', data: marca })
  }
}

async function remove(req: Request, res: Response) {
  const repository = getRepo()
  const id = Number(req.params.id)
  const marca = await repository.delete({ id })

  if (!marca) {
    res.status(404).send({ message: 'Marca no encontrada.' })
  } else {
    res.status(200).send({ message: 'Marca borrada con exito.' })
  }
}

export { sanitizeMarcaInput, findAll, findOne, add, update, remove }
