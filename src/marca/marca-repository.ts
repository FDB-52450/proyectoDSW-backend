import { Repository } from '../shared/repository.js'
import { Marca } from './marca-entity.js'

const marcas = [
  new Marca(
    'NVIDIA',
    'a7K9b2X4zQ8mP1L0n',
  ),
]

export class MarcaRepository implements Repository<Marca> {
  public findAll(): Marca[] | undefined {
    return marcas
  }

  public findOne(item: { id: string }): Marca | undefined {
    return marcas.find((marca) => marca.id === item.id)
  }

  public add(item: Marca): Marca | undefined {
    marcas.push(item)
    return item
  }

  public update(item: Marca): Marca | undefined {
    const marcaIdx = marcas.findIndex((marca) => marca.id === item.id)

    if (marcaIdx !== -1) {
      marcas[marcaIdx] = { ...marcas[marcaIdx], ...item }
    }
    return marcas[marcaIdx]
  }

  public delete(item: { id: string }): Marca | undefined {
    const marcaIdx = marcas.findIndex((marca) => marca.id === item.id)

    if (marcaIdx !== -1) {
      const deletedMarcas = marcas[marcaIdx]
      marcas.splice(marcaIdx, 1)
      return deletedMarcas
    }
  }
}