import { Request, Response, NextFunction } from 'express'
import { ProductoRepository } from './producto-repository.js'
import { Producto } from './producto-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

import { ImagenRepository } from '../imagen/imagen-repository.js'
import { MarcaRepository } from '../marca/marca-repository.js'
import { CategoriaRepository } from '../categoria/categoria-repository.js'

import { RequestContext, SqlEntityManager } from '@mikro-orm/mysql'

import fs from 'fs'
import { Marca } from '../marca/marca-entity.js'

function sanitizeProductoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    desc: req.body.desc,
    precio: Number(req.body.precio),
    descuento: Number(req.body.descuento),
    stock: Number(req.body.stock),
    imagenes: req.files,
    marcaId: Number(req.body.marcaId),
    categoriaId: Number(req.body.categoriaId)
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]

      // This line of code validates that each key (except destacado or imagenes) actually exists when creating a product (otherwise returns an error.)
      /*if (req.method === "POST" && !(key === 'destacado' || key === 'imagenes')) {
        return res.status(400).send({ message: 'Missing attributes on product creation.'}
      )}*/
    }
  })

  next()
}

function sanitizeProductoFilters(req: Request, res: Response, next: NextFunction) {
  res.locals.filters = {
    precioMin: Number(req.query.precioMin),
    precioMax: Number(req.query.precioMax),
    stockMin: req.query.stockMin,
    stockMax: req.query.stockMax,
    nombre: req.query.nombre,
    destacado: (req.query.destacado === "true"),
    marca: req.query.marca,
    categoria: req.query.categoria
  }
  
  next()
}

function getRepo() {
  const em = RequestContext.getEntityManager()
  return new ProductoRepository(em as SqlEntityManager)
}

async function findAll(req: Request, res: Response) {
  const repository = getRepo()
  const filters: ProductoFilters = res.locals.filters || undefined
  const productos = await repository.findAll(filters)

  if (productos.length == 0) {
    res.status(404).send({ message: 'No hay productos disponibles.'})
  } else {
    res.json({data: productos})
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
  const input = req.body.sanitizedInput
  const repository = getRepo()
  const imagenes = input.imagenes.map((imagen: Express.Multer.File, idx: number) => new Imagen(imagen.filename, (idx === 0)))

  const {marca, categoria} = await convertIdsToEntities(input.marcaId, input.categoriaId)

  if (!marca || !categoria) {
    res.status(401).send({ message: 'Categoria y/o marca no encontrada.'})
    input.imagenes.map((img: Imagen) => {
      if (img.url != "template.png") {fs.unlinkSync("images/" + img.url)}
    })
    return
  }
  
  if (!imagenes) {
    const em = RequestContext.getEntityManager()
    const imagenRepo = new ImagenRepository(em?.fork() as SqlEntityManager)

    imagenes.push(await imagenRepo.findTemplate())
  }

  const productoInput = new Producto(
    input.nombre,
    input.desc,
    input.precio,
    input.stock,
    imagenes,
    marca,
    categoria,
  )

  const producto = await repository.add(productoInput)

  if (!producto) {
    res.status(409).send({ message: 'Producto ya existente.'})
  } else {
    res.status(201).send({ message: 'Producto creado con exito.', data: producto})
  }
}

async function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = Number(req.params.id)
  const input = req.body.sanitizedInput
  const repository = getRepo()

  // ODD FIX

  const {marca, categoria} = await convertIdsToEntities(input.marcaId, input.categoriaId)
  delete input.marcaId
  delete input.categoriaId
  input.marca = marca
  input.categoria = categoria

  const operations = input.operations
  delete input.operations

  const producto = await repository.update(input, operations)
  
  if (!producto) {
    res.status(404).send({ message: 'Producto no encontrado.' })
  } else {
    res.status(200).send({ message: 'Producto actualizado con exito.', data: producto })
  }
}

async function convertIdsToEntities(marcaId: number, categoriaId: number) { 
  const marcaRepo = new MarcaRepository(RequestContext.getEntityManager()?.fork() as SqlEntityManager)
  const marca = await marcaRepo.findOne({id: marcaId})

  const categoriaRepo = new CategoriaRepository(RequestContext.getEntityManager()?.fork() as SqlEntityManager)
  const categoria = await categoriaRepo.findOne({id: categoriaId})

  return {marca: marca, categoria: categoria}
}

async function remove(req: Request, res: Response) {
  const id = Number(req.params.id)
  const repository = getRepo()
  const producto = await repository.delete({ id })

  if (!producto) {
    res.status(404).send({ message: 'Producto no encontrado.' })
  } else {
    res.status(200).send({ message: 'Producto borrado con exito.' })
  }
}

export { sanitizeProductoInput, sanitizeProductoFilters, findAll, findOne, add, update, remove }
