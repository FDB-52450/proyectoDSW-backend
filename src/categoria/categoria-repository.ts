import { Repository } from '../shared/repository.js'
import { Categoria } from './categoria-entity.js'

const categorias = [
  new Categoria(
    'PLACAS DE VIDEO',
  ),
  new Categoria(
    'MICROPROCESADORES'
  )
]

export class CategoriaRepository implements Repository<Categoria> {
  public findAll(): Categoria[] | undefined {
    return categorias
  }

  public findOne(item: { id: string }): Categoria | undefined {
    return categorias.find((categoria) => categoria.id === item.id)
  }

  public add(item: Categoria): Categoria | undefined {
    categorias.push(item)
    return item
  }

  public update(item: Categoria): Categoria | undefined {
    const categoriaIdx = categorias.findIndex((categoria) => categoria.id === item.id)

    if (categoriaIdx !== -1) {
      categorias[categoriaIdx] = { ...categorias[categoriaIdx], ...item }
    }
    return categorias[categoriaIdx]
  }

  public delete(item: { id: string }): Categoria | undefined {
    const categoriaIdx = categorias.findIndex((categoria) => categoria.id === item.id)

    if (categoriaIdx !== -1) {
      const deletedCategorias = categorias[categoriaIdx]
      categorias.splice(categoriaIdx, 1)
      return deletedCategorias
    }
  }
}