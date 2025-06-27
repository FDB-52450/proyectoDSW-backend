import crypto from 'node:crypto'

export class Categoria {
  constructor(
    public nombre: string,
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}