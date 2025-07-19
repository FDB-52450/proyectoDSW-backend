import { Imagen } from '../imagen/imagen-entity.js'
import { Repository } from '../shared/repository.js'
import { Marca } from './marca-entity.js'

import fs from 'fs'

const marcas = [
  new Marca(
    'INTEL',
    new Imagen('test.jpg', true)
  ),
]

export class MarcaRepository implements Repository<Marca> {
  public findAll(): Marca[] | undefined {
    return marcas
  }

  public findOne(item: { id: number }): Marca | undefined {
    return marcas.find((marca) => marca.id === item.id)
  }

  public add(item: Marca): Marca | undefined {
    marcas.push(item)
    return item
  }

  public update(item: Marca): Marca | undefined {
    const marcaIdx = marcas.findIndex((marca) => marca.id === item.id)

    if (marcaIdx !== -1) {
      let marca = marcas[marcaIdx]

      console.log(item)

      if (item.imagen.url === 'remove') {
        item.imagen = new Imagen()
        fs.unlinkSync("images/" + marca.imagen.url)
      } else if (item.imagen.url === 'keep') {
        item.imagen = marca.imagen
      } else { // UPDATE IMAGE
        fs.unlinkSync("images/" + marca.imagen.url)
      }
      
      marcas[marcaIdx] = { ...marcas[marcaIdx], ...item }
    }
    return marcas[marcaIdx]
  }

  public delete(item: { id: number }): Marca | undefined {
    const marcaIdx = marcas.findIndex((marca) => marca.id === item.id)

    if (marcaIdx !== -1) {
      const deletedMarca = marcas[marcaIdx]
      fs.unlinkSync("images/" + deletedMarca.imagen.url)
      marcas.splice(marcaIdx, 1)

      return deletedMarca
    }
  }

  public handleImages() {
    
  }
}