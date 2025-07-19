import crypto from 'node:crypto'

export class Administrador {
  constructor(
    public nombre: string,
    public passwordHash: string,
    public id = crypto.randomInt(1000, 10000)
  ) {
    this.passwordHash = Administrador.hashPassword(this.passwordHash)
  }

  static hashPassword(password: string): string {
    if (!process.env.SALT) {
      throw new Error('SALT environment variable is not set')
    }
    
    return crypto.scryptSync(password, process.env.SALT, 64).toString('hex')
  }
}