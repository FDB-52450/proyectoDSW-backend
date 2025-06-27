import { Request, Response, NextFunction } from 'express'
import { ProductoRepository } from './producto-repository.js'
import { Producto } from './producto-entity.js'
import { ProductoFilters } from './productoFilters-entity.js'
import { describe } from 'node:test'

const repository = new ProductoRepository()

function sanitizeProductoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    desc: req.body.desc,
    precio: req.body.precio,
    descuento: req.body.descuento,
    stock: req.body.stock,
    stockReservado: req.body.stockReservado,
    destacado: req.body.destacado,
    fechaIngreso: req.body.fechaIngreso,
    imagenLink: req.body.imagenLink,
    marca: req.body.marca.marca,
    categoria: req.body.categoria
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

function sanitizeProductoFilters(req: Request, res: Response, next: NextFunction) {
  res.locals.filters = {
    precioMin: req.query.precioMin,
    precioMax: req.query.precioMax,
    stockMin: req.query.stockMin,
    stockMax: req.query.stockMax,
    nombre: req.query.nombre,
    destacado: req.query.destacado,
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
  }
  
  res.json({ data: producto })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const productoInput = new Producto(
    input.nombre,
    input.desc,
    input.precio,
    input.descuento,
    input.stock,
    input.stockReservado,
    input.destacado,
    input.fechaIngreso,
    input.imagenLink,
    input.marca,
    input.categoria
  )

  const producto = repository.add(productoInput)
  res.status(201).send({ message: 'Producto creada', data: producto})
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const producto = repository.update(req.body.sanitizedInput)

  if (!producto) {
    res.status(404).send({ message: 'Producto not found' })
  }

  res.status(200).send({ message: 'Producto updated successfully', data: producto })
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
