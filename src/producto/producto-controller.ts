import { Request, Response, NextFunction } from 'express'
import { ProductoRepository } from './producto-repository.js'
import { Producto } from './producto-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

import { MarcaRepository } from '../marca/marca-repository.js'
import { CategoriaRepository } from '../categoria/categoria-repository.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import { auditLogger } from '../shared/loggers.js'

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new ProductoRepository(em as SqlEntityManager)
}

async function findAll(req: Request, res: Response) {
  const repository = getRepo()
  const filters: ProductoFilters = req.query || undefined
  const page = Number(req.query.page ?? 1)

  if (page < 1) {
    res.status(401).send({ message: 'Numero de pagina invalido'})
    return
  }
  
  const [productos, totalItems] = await repository.findAll(page, filters)

  if (productos.length == 0) {
    res.status(404).send({ message: 'No hay productos disponibles.'})
  } else {
    const totalPages = Math.ceil(totalItems / 20)
    const paginationData = {
      totalProducts: totalItems, 
      totalPages, 
      currentPage: page, 
      pageSize: 20
    }

    res.json({data: productos, pagination: paginationData})
  }
}

async function findOne(req: Request, res: Response) {
  const id = Number(req.params.id)
  const repository = getRepo()
  const producto = await repository.findOne({ id })

  if (!producto) {
    res.status(404).send({ message: 'Producto no encontrado.' })
  } else {
    res.json({ data: producto })
  }
}

async function add(req: Request, res: Response) {
  const input = req.body
  const repository = getRepo()

  const marca = await convertIdToMarca(input.marcaId)
  const categoria = await convertIdToCategoria(input.categoriaId)

  if (!marca || !categoria) {
    res.status(401).send({ message: 'Categoria y/o marca no encontrada.'})
    return
  }

  let imagenes: Array<Imagen>

  if (input.imagenes) {
    imagenes = input.imagenes.map((imagen: Express.Multer.File, idx: number) => new Imagen(imagen.buffer, (idx === 0)))
  } else if (input.imagen) {
    imagenes = [new Imagen(input.imagen.buffer, true)]
  } else {
    imagenes = []
  } // PATCH
  
  const productoInput = new Producto(
    input.nombre,
    input.desc,
    input.precio,
    input.stock,
    input.descuento,
    input.destacado,
    imagenes,
    marca,
    categoria,
  )

  const check = await repository.checkConstraint(productoInput)

  if (!check) {
    const producto = await repository.add(productoInput)

    if (!producto) {
      res.status(500).send({ message: 'Ocurrio un error, intente mas tarde.' })
    } else {
      auditLogger.info({entity: 'producto', action: 'create', user: req.session.user, data: producto})

      res.status(201).send({ message: 'Producto creado con exito.', data: producto})
    }
  } else {
    res.status(409).send({ message: 'Producto ya existente.' })
  }
}

async function update(req: Request, res: Response) {
  req.body.id = req.params.id
  
  const input = req.body
  const repository = getRepo()
  const imagesToRemove = req.body.imagesToRemove ? req.body.imagesToRemove : []

  if (input.imagenes) {
    input.imagenes = input.imagenes.map((imagen: Express.Multer.File, idx: number) => new Imagen(imagen.buffer, (idx === 0)))
  } else if (input.imagen) {
    input.imagenes = [new Imagen(input.imagen.buffer, true)]
  } else {
    input.imagenes = []
  }

  if (input.marcaId) {
    const marca = await convertIdToMarca(input.marcaId)

    if (!marca) {
      res.status(401).send({ message: 'Marca no encontrada.'})
      return
    } else {
      input.marca = marca
    }

    delete input.marcaId
  }

  if (input.categoriaId) {
    const categoria = await convertIdToCategoria(input.categoriaId)

    if (!categoria) {
      res.status(401).send({ message: 'Marca no encontrada.'})
      return
    } else {
      input.categoria = categoria
    }

    delete input.categoriaId
  }

  const check = await repository.checkConstraint(input)

  if (!check) {
    const producto = await repository.update(input, imagesToRemove)
  
    if (!producto) {
      res.status(404).send({ message: 'Producto no encontrado.' })
    } else {
      auditLogger.info({entity: 'producto', action: 'update', user: req.session.user, data: req.body})

      res.status(200).send({ message: 'Producto actualizado con exito.', data: producto })
    }
  } else {
    res.status(409).send({ message: 'Nombre de producto ya usado.' })
  }
}

async function convertIdToMarca(marcaId: number) {
  const marcaRepo = new MarcaRepository(RequestContext.getEntityManager()?.fork() as SqlEntityManager)
  const marca = await marcaRepo.findOne({id: marcaId})

  return marca
}

async function convertIdToCategoria(categoriaId: number) {
  const categoriaRepo = new CategoriaRepository(RequestContext.getEntityManager()?.fork() as SqlEntityManager)
  const categoria = await categoriaRepo.findOne({id: categoriaId})

  return categoria
}

async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  const repository = getRepo()

  try {
    const producto = await repository.delete({ id })
    
    if (!producto) {
      res.status(404).send({ message: 'Producto no encontrado.' })
    } else {
      auditLogger.info({entity: 'producto', action: 'delete', user: req.session.user, data: {id: producto.id, nombre: producto.nombre}})

      res.status(200).send({ message: 'Producto borrado con exito.' })
    }
  } catch (err) {
      if (err instanceof Error) {
        res.status(500).send({message: err.message})
      } else {
        res.status(500).send({message: 'Error desconocido.'})
      }
  }

}

export { findAll, findOne, add, update, remove }
