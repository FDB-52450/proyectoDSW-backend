import crypto from 'node:crypto'

export class Marca {
  constructor(
    public nombre: string,
    public imagenLink: string,
    public id = crypto.randomInt(1000, 10000).toString()
  ) {}
}