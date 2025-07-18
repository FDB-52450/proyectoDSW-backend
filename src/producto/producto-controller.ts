import { Request, Response, NextFunction } from 'express'
import { ProductoRepository } from './producto-repository.js'
import { Producto } from './producto-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'
import { Imagen } from '../imagen/imagen-entity.js'

import fs from 'fs'

const repository = new ProductoRepository()

function sanitizeProductoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    desc: req.body.desc,
    precio: Number(req.body.precio),
    descuento: Number(req.body.descuento),
    stock: Number(req.body.stock),
    imagenes: req.files,
    marca: req.body.marca,
    categoria: req.body.categoria
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
  // TODO: Determine if invalid input should just throw an error.

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

function findAll(req: Request, res: Response) {
  const filters: ProductoFilters = res.locals.filters || undefined

  res.json({ data: repository.findAll(filters) })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const producto = repository.findOne({ id })

  if (!producto) {
    res.status(404).send({ message: 'Producto not found' })
  } else {
    res.json({ data: producto })
  }
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput
  const imagenes = input.imagenes.map((imagen: Express.Multer.File) => new Imagen(imagen.filename))
  
  if (!imagenes) {imagenes.push(new Imagen())}

  const productoInput = new Producto(
    input.nombre,
    input.desc,
    input.precio,
    input.descuento,
    input.stock,
    imagenes,
    input.marca,
    input.categoria
  )

  const producto = repository.add(productoInput)

  res.status(201).send({ message: 'Producto creada', data: producto})
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  delete req.body.sanitizedInput.imagenes

  const producto = repository.update(req.body.sanitizedInput)

  if (!producto) {
    res.status(404).send({ message: 'Producto not found' })
  } else {
    res.status(200).send({ message: 'Producto updated successfully', data: producto })
  }
}

function updateImages(req: Request, res: Response) {
  res.status(404).send({ message: 'NOT IMPLEMENTED YET' })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const producto = repository.delete({ id })

  if (!producto) {
    res.status(404).send({ message: 'Producto not found' })
  } else {
    res.status(200).send({ message: 'Producto deleted successfully' })
  }
}

export { sanitizeProductoInput, sanitizeProductoFilters, findAll, findOne, add, update, remove }
