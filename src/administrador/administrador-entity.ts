import crypto from 'node:crypto'
import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Administrador {
  @PrimaryKey()
  id!: number

  @Property()
  nombre!: string

  @Property({hidden: true})
  passwordHash!: string

  @Property()
  role!: string

  constructor(
    nombre: string,
    passwordUnhashed: string,
    role: string = 'admin'
  ) {
    this.nombre = nombre
    this.passwordHash = Administrador.hashPassword(passwordUnhashed)
    this.role = role
  }

  static hashPassword(password: string): string {
    if (!process.env.SALT) {
      throw new Error('SALT environment variable is not set')
    }
    
    return crypto.scryptSync(password, process.env.SALT, 64).toString('hex')
  }
}