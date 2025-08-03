import { Repository } from '../shared/repository.js'
import { Marca } from './marca-entity.js'

import { EntityManager} from '@mikro-orm/mysql'

export class MarcaRepository implements Repository<Marca> {
  constructor(
    private marcaEm: EntityManager
  ) {}

  public async findAll(): Promise<Marca[]> {
    return await this.marcaEm.find(Marca, {}, {populate: ['imagen']})
  }

  public async findOne(item: { id: number }): Promise<Marca | null> {
    return await this.marcaEm.findOne(Marca, {id: item.id}, {populate: ['imagen']})
  }

  public async checkConstraint(item: Marca): Promise<boolean> {
    const marcaConflict = await this.marcaEm.findOne(Marca, {nombre: item.nombre})

    if (marcaConflict) return true

    return false
  }

  public async add(item: Marca): Promise<Marca | null> {
    try {
      await this.marcaEm.persistAndFlush(item)
      return item
    } catch (err) {
      return null
    }
  }

  public async update(item: Marca): Promise<Marca | null> {
    // DOCS: item.imagen can be either an actual image entity, null or undefined:
    // image entity -> ADD IMAGE AND DELETE OLD ONE
    // null -> DELETE IMAGE (SET IT TO NULL)
    // undefined -> KEEP IMAGE
    const marca = await this.findOne(item)

    if (marca) {
      // FIX
      if ('imagen' in item) {
        if (marca.imagen) await this.marcaEm.remove(marca.imagen)
      }
    
      Object.assign(marca, item)

      try {
        await this.marcaEm.flush()
      } catch (err) {
        throw new Error()
      }
    }

    return marca
  }

  public async delete(item: { id: number }): Promise<Marca | null> {
    const marca = await this.findOne(item)

    if (marca) {
      await this.marcaEm.removeAndFlush(marca)
    }

    return marca
  }

  public async createMarcas() {
    const marcas = [
      new Marca('INTEL', null),
      new Marca('AMD', null)
    ]

    await this.marcaEm.persistAndFlush(marcas)
  }
}