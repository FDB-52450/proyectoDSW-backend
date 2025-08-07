import { Administrador } from './administrador-entity.js'
import { EntityManager } from '@mikro-orm/mysql'

export class AdministradorRepository{
  constructor(
    private adminEm: EntityManager
  ) {}

  public async findAll(): Promise<Administrador[]> {
    return await this.adminEm.find(Administrador, {})
  }

  public async findOne({ id }: { id: number }): Promise<Administrador | null> {
    const admin = await this.adminEm.findOne(Administrador, {id: id})

    return admin
  }

  public async findByName({ nombre }: { nombre: string }): Promise<Administrador | null> {
    const admin = await this.adminEm.findOne(Administrador, {nombre: nombre})

    return admin
  }

  public async checkConstraint(item: Administrador): Promise<boolean> {
    const administradorConflict = await this.adminEm.findOne(Administrador, {nombre: item.nombre})

    if (administradorConflict) return true

    return false
  }

  public async add(item: Administrador): Promise<Administrador | null> {
    try {
      await this.adminEm.persistAndFlush(item)
      return item
    } catch {
      return null
    }
  }

  public async update(item: Administrador): Promise<Administrador | null> {
    const administrador = await this.findOne(item)

    if (administrador) {
      Object.assign(administrador, item)
      await this.adminEm.flush()
    }

    return administrador
  }

  public async delete(item: { id: number }): Promise<Administrador | null> {
    const administrador = await this.findOne(item)

    if (administrador) {
      if (administrador.role === 'superadmin') {
        throw new Error("A super admin cannot delete a super admin.")
      }

      await this.adminEm.removeAndFlush(administrador)
    }

    return administrador
  }
}