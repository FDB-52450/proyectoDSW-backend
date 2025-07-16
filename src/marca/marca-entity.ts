import crypto from 'node:crypto'
import { Imagen } from '../imagen/imagen-entity.js'

export class Marca {
  constructor(
    public nombre: string,
    public imagen: Imagen,
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}