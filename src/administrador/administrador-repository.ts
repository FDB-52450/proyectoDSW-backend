import { Administrador } from './administrador-entity.js'
import { EntityManager } from '@mikro-orm/mysql'

export class AdministradorRepository {
  constructor(
    private adminEm: EntityManager
  ) {}

  async findOne({ nombre }: { nombre: string }): Promise<Administrador | null> {
    const admin = await this.adminEm.findOne(Administrador, {nombre: nombre})   
    return admin
  }

  async createAdmins() {
    const administradores = [
      new Administrador('admin', 'admin123'),
      new Administrador('adminAlt', 'admin456')
    ]

    await this.adminEm.persistAndFlush(administradores)
  }
}