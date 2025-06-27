import crypto from 'node:crypto'
import { Marca } from '../marca/marca-entity.js'
import { Categoria } from '../categoria/categoria-entity.js'

export class Producto {
  constructor(
    public nombre: string,
    public desc: string,
    public precio: number,
    public descuento: number,
    public stock: number,
    public stockReservado: number,
    public destacado: boolean,
    public fechaIngreso: Date,
    public imagenLink: string,
    public marca: Marca,
    public categoria: Categoria,
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}