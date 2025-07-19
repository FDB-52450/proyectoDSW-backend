import { Repository } from '../shared/repository.js'
import { Categoria } from './categoria-entity.js'

import { EntityManager } from '@mikro-orm/mysql'

export class CategoriaRepository /*implements Repository<Categoria>*/{
  constructor(
    private categoriaEm: EntityManager
  ) {}

  public async findAll(): Promise<Categoria[]> {
    return await this.categoriaEm.find(Categoria, {})
  }

  public async findOne(item: { id: number }): Promise<Categoria | null> {
    return await this.categoriaEm.findOne(Categoria, { id: item.id })
  }

  public async add(item: Categoria): Promise<Categoria | null> {
    try {
      await this.categoriaEm.persistAndFlush(item)
      return item
    } catch {
      return null
    }
  }

  public async update(item: Categoria): Promise<Categoria | null> {
    const categoria = await this.findOne(item)

    if (categoria) {
      Object.assign(categoria, item)
      await this.categoriaEm.flush()
    }

    return categoria
  }

  public async delete(item: { id: number }): Promise<Categoria | null> {
    const categoria = await this.findOne(item)

    if (categoria) {
      await this.categoriaEm.removeAndFlush(categoria)
    }

    return categoria
  }
}